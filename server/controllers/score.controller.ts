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
    const t = (label: string, start: number) =>
    console.log(`⏱ ${label}: ${((performance.now() - start) / 1000).toFixed(2)}s`);


    try {
      const mongoProjectId = req.params.userProjectId as string;
      const userId = req.userPayload?.userId;

      if (!userId)
        return res
          .status(401)
          .json({ error: "Unauthorized: User ID is missing." });
      if (!mongoProjectId)
        return res.status(400).json({ error: "Invalid Project ID." });

      const [user, userProject, repoGroup] = await Promise.all([
        RepoService.findUser(userId),
        prisma.userProject.findFirst({
          where: { mongoProjectId, userId },
        }),
        RepoGroup.findById(mongoProjectId),
      ]);

      if (!user.githubAccessToken)
        return res
          .status(401)
          .json({
            error: "ไม่พบ GitHub Token กรุณาล็อกอินด้วย GitHub อีกครั้ง",
          });
      if (!userProject)
        return res.status(404).json({ error: "ไม่พบโปรเจกต์ในระบบ Postgres" });
      if (!repoGroup?.repos?.length)
        return res
          .status(404)
          .json({
            error: "ไม่พบข้อมูล Repository ใน MongoDB หรือโปรเจกต์ว่างเปล่า",
          });

      masterWorkspace = await fs.mkdtemp(
        path.join(os.tmpdir(), `portfolio_master_${Date.now()}_`),
      );
      const startOld = performance.now();
        let s = performance.now();

      await Promise.all(
        repoGroup.repos.map(async (repoData) => {
          const urlParts = repoData.url.split("/");
          const repoOwner = urlParts[urlParts.length - 2];
          const repoName = urlParts[urlParts.length - 1];
          if (!repoOwner || !repoName) return;

          try {
            const ds = performance.now();
            const { sourceCodePath, tempDirToCleanUp } =
              await RepoService.downloadRepoForAnalysis(
                user.githubAccessToken!,
                repoOwner,
                repoName,
              );
              console.log(`⏱ ${repoName}: ${((performance.now() - ds) / 1000).toFixed(2)}s`)
            const targetPath = path.join(masterWorkspace, repoName);

            await fs.rename(sourceCodePath, targetPath).catch(async () => {
              await fs.cp(sourceCodePath, targetPath, { recursive: true });
              await fs.rm(tempDirToCleanUp, { recursive: true, force: true });
            });
          } catch (err) {
            console.error(`❌ ข้ามการดาวน์โหลด ${repoName}:`, err);
          }
        }),
      );
      console.log(`⏱ download ทั้งหมด: ${((performance.now() - s) / 1000).toFixed(2)}s`);
      const endOld = performance.now();
      const timeOldSec = ((endOld - startOld) / 1000).toFixed(2);
      console.log(`ใช้เวลา: ${timeOldSec} วินาที`);
      console.log(`กำลังวิเคราะห์โค้ดภาพรวม: ${repoGroup.groupName}...`);
      const analysisResult = await ScoreService.analyzeProject(masterWorkspace);

      let savedAnalysis = null;
      if (analysisResult.raw_scores) {
        const scorePayload = {
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
        };

        [savedAnalysis] = await Promise.all([
          prisma.project_analysis.upsert({
            where: { user_project_id: userProject.id },
            update: scorePayload,
            create: { user_project_id: userProject.id, ...scorePayload },
          }),
          RepoGroup.findByIdAndUpdate(repoGroup._id, { isAnalyzed: true }),
        ]);
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
        await fs
          .rm(masterWorkspace, { recursive: true, force: true })
          .catch(console.error);
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
