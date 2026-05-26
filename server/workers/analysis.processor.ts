import { Job } from "bullmq";
import fs from "fs/promises";
import path from "path";
import os from "os";

import RepoService from "../services/repo.service.js";
import ScoreService from "../services/score.service.js";
import { prisma } from "../lib/prisma.js";
import { RepoGroup } from "../models/RepoGroup.js";

export default async function (job: Job) {
  console.log(`⚙️ [PROCESSOR] เริ่มวิเคราะห์งาน ${job.id}`);
  const { userId, mongoProjectId } = job.data;
  let masterWorkspace = "";

  try {
    await job.updateProgress(10); 

    const [user, userProject, repoGroup] = await Promise.all([
      RepoService.findUser(userId),
      prisma.userProject.findFirst({ where: { mongoProjectId, userId } }),
      RepoGroup.findById(mongoProjectId),
    ]);
    console.log("RepoGroup : ", RepoGroup)
    console.log("userProject : ", userProject)

    if (!user.githubAccessToken) throw new Error("ไม่พบ GitHub Token");
    if (!userProject) throw new Error("ไม่พบโปรเจกต์ใน Postgres");
    if (!repoGroup?.repos?.length) throw new Error("โปรเจกต์ว่างเปล่า");

    await job.updateProgress(30);

    masterWorkspace = await fs.mkdtemp(path.join(os.tmpdir(), `portfolio_master_${Date.now()}_`));
    console.log("Hello Start downloading")
    await Promise.all(
      repoGroup.repos.map(async (repoData) => {
        const urlParts = repoData.url.split("/");
        const repoOwner = urlParts[urlParts.length - 2];
        const repoName = urlParts[urlParts.length - 1];
        if (!repoOwner || !repoName) return;

        try {
          const { sourceCodePath, tempDirToCleanUp } = await RepoService.downloadRepoForAnalysis(
            user.githubAccessToken!,
            repoOwner,
            repoName
          );
          const targetPath = path.join(masterWorkspace, repoName);
          
          await fs.rename(sourceCodePath, targetPath).catch(async () => {
            await fs.cp(sourceCodePath, targetPath, { recursive: true });
            await fs.rm(tempDirToCleanUp, { recursive: true, force: true });
          });
        } catch (err) {
          console.error(`❌ ข้ามการดาวน์โหลด ${repoName}:`, err);
        }
      })
    );
    console.log("Hello ending download")
    await job.updateProgress(60);
    console.log("Start Analyze")
    // 3. เริ่มวิเคราะห์โค้ด
    const analysisResult = await ScoreService.analyzeProject(masterWorkspace);

    await job.updateProgress(85);

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

      await prisma.project_analysis.upsert({
        where: { user_project_id: userProject.id },
        update: scorePayload,
        create: { user_project_id: userProject.id, ...scorePayload },
      });
      await RepoGroup.findByIdAndUpdate(repoGroup._id, { isAnalyzed: true });
    }

    await job.updateProgress(100);
    console.log("Result : ", analysisResult)
    return { success: true, groupName: repoGroup.groupName, score: analysisResult.finalScore };

  } catch (error: any) {
    throw new Error(`Analysis Pipeline Failed: ${error.message}`);
  } finally {
    if (masterWorkspace) {
      await fs.rm(masterWorkspace, { recursive: true, force: true }).catch((err) => {
        console.error("Failed to clean up workspace:", err);
      });
    }
  }
}