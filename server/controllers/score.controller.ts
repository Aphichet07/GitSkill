import type { Request, Response } from "express";
import RepoService from "../services/repo.service.js";
import ScoreService from "../services/score.service.js";
import { prisma } from "../lib/prisma.js";
import { RepoGroup } from "../models/RepoGroup.js";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { performance } from "perf_hooks";

const ScoreController = {
  async AnalyzeGroup(req: Request, res: Response) {
    let masterWorkspace = "";

    try {
      const mongoProjectId = req.params.userProjectId as string;
      const userId = req.userPayload?.userId;

      if (!userId) {
        return res
          .status(401)
          .json({ error: "Unauthorized: User ID is missing." });
      }

      if (!mongoProjectId) {
        return res.status(400).json({ error: "Invalid Project ID." });
      }

      const user = await RepoService.findUser(userId);
      if (!user.githubAccessToken) {
        return res
          .status(401)
          .json({
            error: "ไม่พบ GitHub Token กรุณาล็อกอินด้วย GitHub อีกครั้ง",
          });
      }

      console.log(`ค้นหาโปรเจกต์ใน Postgres ด้วย:`);
      console.log(`-> mongoProjectId: "${mongoProjectId}"`);
      console.log(`-> userId: ${userId}`);

      const userProject = await prisma.userProject.findFirst({
        where: { mongoProjectId: mongoProjectId, userId: userId },
      });

      if (!userProject) {
        return res.status(404).json({ error: "ไม่พบโปรเจกต์ในระบบ Postgres" });
      }

      const repoGroup = await RepoGroup.findById(mongoProjectId);

      if (!repoGroup || !repoGroup.repos || repoGroup.repos.length === 0) {
        return res
          .status(404)
          .json({
            error: "ไม่พบข้อมูล Repository ใน MongoDB หรือโปรเจกต์ว่างเปล่า",
          });
      }

      masterWorkspace = await fs.mkdtemp(
        path.join(os.tmpdir(), `portfolio_master_${Date.now()}_`),
      );
      console.log(`สร้าง Master Workspace สำหรับวิเคราะห์: ${masterWorkspace}`);

      console.log("\n--- เริ่มทดสอบความเร็วแบบเก่า ---");
      const oldWorkspace = await fs.mkdtemp(path.join(os.tmpdir(), `bench_old_${Date.now()}_`));
      const startOld = performance.now();
      for (const repoData of repoGroup.repos) {
        // ดึง owner/repo ออกมาจาก URL ของ Github (เช่น https://github.com/Aphichet07/GitSkill)
        const urlParts = repoData.url.split("/");
        const repoOwner = urlParts[urlParts.length - 2];
        const repoName = urlParts[urlParts.length - 1];

        if (!repoOwner) return;
        if (!repoName) return;
        console.log(`⬇กำลังดาวน์โหลด: ${repoOwner}/${repoName}...`);

        try {
          const { sourceCodePath, tempDirToCleanUp } =
            await RepoService.downloadRepoForAnalysis(
              user.githubAccessToken,
              repoOwner,
              repoName,
            );

          const targetPath = path.join(masterWorkspace, repoName);
          await fs.cp(sourceCodePath, targetPath, { recursive: true });

          await fs.rm(tempDirToCleanUp, { recursive: true, force: true });
        } catch (downloadErr) {
          console.error(
            `ข้ามการดาวน์โหลด ${repoName} เนื่องจากมีปัญหา:`,
            downloadErr,
          );
        }
      }
      const endOld = performance.now();
      const timeOldSec = ((endOld - startOld) / 1000).toFixed(2);
      console.log(`แบบเก่าใช้เวลา: ${timeOldSec} วินาที`);

      // console.log("\n--- เริ่มทดสอบความเร็วแบบใหม่ ---");
      masterWorkspace = await fs.mkdtemp(path.join(os.tmpdir(), `portfolio_master_${Date.now()}_`));
      const startNew = performance.now();

      const downloadPromises = repoGroup.repos.map(async (repoData) => {
        const urlParts = repoData.url.split("/");
        const repoOwner = urlParts[urlParts.length - 2];
        const repoName = urlParts[urlParts.length - 1];

        if (!repoOwner) return;
        if (!repoName) return;
        if (!user.githubAccessToken) {
        return res
          .status(401)
          .json({
            error: "ไม่พบ GitHub Token กรุณาล็อกอินด้วย GitHub อีกครั้ง",
          });
      }

        try {
          const { sourceCodePath, tempDirToCleanUp } = await RepoService.downloadRepoForAnalysis(
            user.githubAccessToken, repoOwner, repoName
          );
          await fs.cp(sourceCodePath, path.join(masterWorkspace, repoName), { recursive: true });
          await fs.rm(tempDirToCleanUp, { recursive: true, force: true });
        } catch (err) {
          console.error(`❌ ข้ามการดาวน์โหลด ${repoName}:`, err);
        }
      });

      await Promise.all(downloadPromises);

      const endNew = performance.now();
      const timeNewSec = ((endNew - startNew) / 1000).toFixed(2);
      console.log(`แบบใหม่ใช้เวลา: ${timeNewSec} วินาที\n`);

      // สรุปผลการเปรียบเทียบ
      const diffSec = ((endOld - startOld) - (endNew - startNew)) / 1000;
      const percentFaster = (((endOld - startOld) - (endNew - startNew)) / (endOld - startOld) * 100).toFixed(0);
      
      const benchmarkStats = {
        sequential_time_seconds: Number(timeOldSec),
        parallel_time_seconds: Number(timeNewSec),
        time_saved_seconds: Number(diffSec.toFixed(2)),
        percentage_faster: Number(percentFaster)
      };

      console.log(`แบบใหม่ประหยัดเวลาไป ${diffSec.toFixed(2)} วินาที (เร็วขึ้น ${percentFaster}%)`);

      console.log(
        `กำลังวิเคราะห์โค้ดภาพรวมของกลุ่ม: ${repoGroup.groupName}...`,
      );
      const analysisResult = await ScoreService.analyzeProject(masterWorkspace);

      let savedAnalysis = null;
      if (analysisResult.raw_scores) {
        savedAnalysis = await prisma.project_analysis.upsert({
          where: { user_project_id: userProject.id },
          update: {
            grade: analysisResult.grade,
            final_score: analysisResult.finalScore,
            doc_score: analysisResult.raw_scores.docScore,
            arch_score: analysisResult.raw_scores.archScore,
            test_ci_score: analysisResult.raw_scores.testCiScore,
            clean_code_score: analysisResult.raw_scores.cleanCodeScore,
            efficiency_score: analysisResult.raw_scores.efficiencyScore,
            security_score: analysisResult.raw_scores.securityScore,
            habit_score: analysisResult.raw_scores.habitScore,
            detailed_stats: analysisResult.detailed_stats ?? {},
            insight: analysisResult.insight,
            analyzed_at: new Date(),
          },
          create: {
            user_project_id: userProject.id,
            grade: analysisResult.grade,
            final_score: analysisResult.finalScore,
            doc_score: analysisResult.raw_scores.docScore,
            arch_score: analysisResult.raw_scores.archScore,
            test_ci_score: analysisResult.raw_scores.testCiScore,
            clean_code_score: analysisResult.raw_scores.cleanCodeScore,
            efficiency_score: analysisResult.raw_scores.efficiencyScore,
            security_score: analysisResult.raw_scores.securityScore,
            habit_score: analysisResult.raw_scores.habitScore,
            detailed_stats: analysisResult.detailed_stats ?? {},
            insight: analysisResult.insight,
          },
        });

        await RepoGroup.findByIdAndUpdate(repoGroup._id, { isAnalyzed: true });

        console.log(`บันทึก ${repoGroup.groupName} สำเร็จ!`);
      }

      res.json({
        message: "Portfolio Analysis Completed!",
        group: repoGroup.groupName,
        total_repos_analyzed: repoGroup.repos.length,
        result: analysisResult,
        db_record: savedAnalysis,
      });
    } catch (err: any) {
      console.error("Critical Controller Error:", err);
      res
        .status(500)
        .json({ error: "Internal Server Error", details: err.message });
    } finally {
      if (masterWorkspace) {
        try {
          await fs.rm(masterWorkspace, { recursive: true, force: true });
          console.log(`Cleaned up Master Workspace: ${masterWorkspace}`);
        } catch (rmErr) {
          console.error("Failed to clean up Master Workspace", rmErr);
        }
      }
    }
  },

  async Analysis(req: Request, res: Response) {
    try {
      const projectId = req.params.projectId as string;

      const userProject = await prisma.userProject.findFirst({
        where: { mongoProjectId: projectId },
        include: {
          projectAnalysis: true, 
        },
      });

      if (!userProject || !userProject.projectAnalysis) {
        return res.json({ success: false, message: "ยังไม่ได้วิเคราะห์" });
      }

      res.json({
        success: true,
        data: userProject.projectAnalysis,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
};

export default ScoreController;
