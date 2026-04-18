import { GoogleGenerativeAI } from "@google/generative-ai";
import { RepoGroup } from "../models/RepoGroup.js";
import { Analysis } from "../models/Analysis.js";
import { prisma } from "../lib/prisma.js";
import type { IRepoGroup } from "../models/RepoGroup.js";
import type { IAnalysis } from "../models/Analysis.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const AnalysisService = {
  async analyzeProject(projectId: string, userId: number) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error(`User ID ${userId} not found in PostgreSQL.`);
    }

    const group = await RepoGroup.findOne({ _id: projectId, userId });
    if (!group) throw new Error("Project not found in MongoDB");

    const repoContents = group.repos
      .map((repo) => `Repo: ${repo}\n[Content Analysis of ${repo}...]`)
      .join("\n\n");

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `
    Analyze these GitHub repositories for a recruiter. 
    Input data: ${repoContents}
    
    Return a JSON object with this EXACT structure:
    {
      "summation": "string",
      "skills": [{"language": "string", "points": "number"}],
      "recommendation": "string",
      "deepcode": "string"
    }
    `;

    const result = await model.generateContent(prompt);
    const analysisData = JSON.parse(result.response.text());

    const savedAnalysis = await Analysis.create({
      projectId,
      userId,
      ...analysisData,
      isAnalyzed: true,
    });

    await RepoGroup.findByIdAndUpdate(projectId, {
      isAnalyzed: true,
      analysisResult: savedAnalysis._id,
    });

    const userProject = await prisma.userProject.upsert({
      where: {
        id:
          (
            await prisma.userProject.findFirst({
              where: { mongoProjectId: projectId, userId: userId },
            })
          )?.id || 0,
      },
      update: { projectName: group.groupName },
      create: {
        userId: userId,
        mongoProjectId: projectId,
        projectName: group.groupName,
      },
    });

    if (analysisData.skills && Array.isArray(analysisData.skills)) {
      await prisma.projectSkill.deleteMany({
        where: { userProjectId: userProject.id },
      });

      await prisma.projectSkill.createMany({
        data: analysisData.skills.map((skill: any) => ({
          userProjectId: userProject.id,
          language: skill.language,
          points: skill.points,
        })),
      });

      const syncTotalTasks = analysisData.skills.map((skill: any) =>
        prisma.userSkill.upsert({
          where: {
            userId_language: {
              userId: userId,
              language: skill.language,
            },
          },
          update: {
            points: { increment: skill.points },
          },
          create: {
            userId: userId,
            language: skill.language,
            points: skill.points,
          },
        }),
      );

      await Promise.all(syncTotalTasks);
    }

    return savedAnalysis;
  },
};

export default AnalysisService;
