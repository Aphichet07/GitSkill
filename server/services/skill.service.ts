import { generateAIInsight } from "./ai.service.js";
import { prisma } from "../lib/prisma.js";
import axios from "axios";

const SkillService = {
  async processSkillsAfterAnalysis(userProjectId: number, userId: number) {
    try {
      console.log("-----------------------------------------------");
      console.log("--------------Welcome To After----------------");
      console.log("-----------------------------------------------");

      const projectAnalysis = await prisma.project_analysis.findFirst({
        where: { user_project_id: userProjectId },
      });

      if (!projectAnalysis) {
        throw new Error(`ไม่พบผลการวิเคราะห์ของ Project ID: ${userProjectId}`);
      }

      const detailedStats = projectAnalysis.detailed_stats as any;
      const languageStats = detailedStats?.languages || {};

      const skillRecords: {
        userProjectId: number;
        skill_name: string;
        category: string;
        points: number;
      }[] = [];

      const MIN_BYTES_THRESHOLD = 2000;
      const PRIMARY_LANG_RATIO = 0.1;

      const totalBytes = Object.values(languageStats).reduce(
        (a: any, b: any) => a + b,
        0,
      ) as number;

      const finalScore = projectAnalysis.final_score || 0;
      const qualityMultiplier = finalScore / 100;

      for (const [lang, bytes] of Object.entries(languageStats)) {
        const languageRatio = (bytes as number) / totalBytes;

        if (
          (bytes as number) < MIN_BYTES_THRESHOLD ||
          languageRatio < PRIMARY_LANG_RATIO
        ) {
          continue;
        }

        const langProficiencyScore =
          projectAnalysis.clean_code_score * 0.4 +
          projectAnalysis.efficiency_score * 0.4 +
          projectAnalysis.arch_score * 0.2;

        skillRecords.push({
          userProjectId: userProjectId,
          skill_name: lang,
          category: "Language",
          points: Math.round(langProficiencyScore),
        });
      }

      const coreMetrics = [
        { name: "Documentation", score: projectAnalysis.doc_score },
        { name: "Architecture", score: projectAnalysis.arch_score },
        { name: "Testing & CI", score: projectAnalysis.test_ci_score },
        { name: "Clean Code", score: projectAnalysis.clean_code_score },
        { name: "Efficiency", score: projectAnalysis.efficiency_score },
        { name: "Security", score: projectAnalysis.security_score },
        { name: "Good Habit", score: projectAnalysis.habit_score },
      ];

      for (const metric of coreMetrics) {
        if (typeof metric.score === "number") {
          skillRecords.push({
            userProjectId: userProjectId,
            skill_name: metric.name,
            category: "Core Metric",
            points: metric.score,
          });
        }
      }

      await prisma.projectSkill.deleteMany({
        where: { userProjectId: userProjectId },
      });

      await prisma.projectSkill.createMany({
        data: skillRecords,
      });

      const aggregatedSkills = await prisma.projectSkill.groupBy({
        by: ["skill_name", "category"],
        where: { project: { userId: userId } },
        _max: { points: true },
      });

      for (const skill of aggregatedSkills) {
        await prisma.userSkill.upsert({
          where: {
            userId_skill_name: {
              userId: userId,
              skill_name: skill.skill_name,
            },
          },
          update: {
            points: skill._max.points || 0,
            lastUpdated: new Date(),
          },
          create: {
            userId: userId,
            skill_name: skill.skill_name,
            category: skill.category,
            points: skill._max.points || 0,
          },
        });
      }
      await this.evaluateUserBadges(userId);

      try {
        console.log("กำลังให้ AI ช่วยสรุป Insight ของโปรเจกต์ สำหรับ HR...");

        const readmeContent = detailedStats?.readme || "";
        const dependencies = detailedStats?.dependencies || "";

        const aiGeneratedInsight = await generateAIInsight(
          projectAnalysis,
          skillRecords,
          readmeContent,
          dependencies,
        );

        if (aiGeneratedInsight) {
          await prisma.project_analysis.update({
            where: { user_project_id: userProjectId },
            data: { insight: aiGeneratedInsight },
          });
          console.log("aiGeneratedInsight : ", aiGeneratedInsight);
          console.log("สร้าง AI Insight สำเร็จ!");
        }
      } catch (aiError) {
        console.error("⚠️ AI Insight generation skipped:", aiError);
      }
      // ==========================================

      console.log(`✅ อัปเดต Skills ให้ User ID: ${userId} เสร็จสิ้น`);
    } catch (error) {
      console.error("❌ SkillService Error :", error);
      throw error;
    }
  },

  async getUserSkills(userId: number) {
    try {
      const userSkills = await prisma.userSkill.findMany({
        where: { userId: userId },
        orderBy: { points: "desc" },
      });

      const languageSkills = userSkills.filter(
        (s) => s.category === "Language",
      );
      const coreMetrics = userSkills.filter(
        (s) => s.category === "Core Metric",
      );

      return {
        languages: languageSkills,
        coreMetrics: coreMetrics,
      };
    } catch (error) {
      console.error("❌ [SkillService] getUserSkills Error:", error);
      throw new Error("ไม่สามารถดึงข้อมูลสกิลจากฐานข้อมูลได้");
    }
  },
  async evaluateUserBadges(userId: number) {
    try {
      const userSkills = await prisma.userSkill.findMany({
        where: { userId: userId },
      });

      for (const skill of userSkills) {
        let isQualified = false;

        if (skill.category === "Core Metric" && skill.points >= 90) {
          isQualified = true;
        } else if (skill.category === "Language" && skill.points >= 80) {
          isQualified = true;
        }

        if (isQualified) {
          const targetBadge = await prisma.badge.findUnique({
            where: { name: skill.skill_name },
          });

          if (targetBadge) {
            const hasBadge = await prisma.userBadge.findFirst({
              where: {
                userId: userId,
                badgeId: targetBadge.id,
              },
            });

            if (!hasBadge) {
              await prisma.userBadge.create({
                data: {
                  userId: userId,
                  badgeId: targetBadge.id,
                },
              });
              console.log(`'${targetBadge.name}' ให้ User ID: ${userId}`);
            }
          }
        }
      }
    } catch (error) {
      console.error("Badge Error :", error);
    }
  },

  async getUserProfileData(userId: number) {
    try {
      const skills = await prisma.userSkill.findMany({
        where: { userId: userId },
        orderBy: { points: "desc" },
      });

      const languages = skills.filter((s) => s.category === "Language");
      const coreMetrics = skills.filter((s) => s.category === "Core Metric");

      const userBadges = await prisma.userBadge.findMany({
        where: { userId: userId },
        include: {
          badge: true,
        },
        orderBy: { earnedAt: "desc" },
      });

      const formattedBadges = userBadges.map((ub) => ({
        id: ub.badge.id,
        name: ub.badge.name,
        description: ub.badge.description,
        iconUrl: ub.badge.iconUrl,
        category: ub.badge.category,
        earnedAt: ub.earnedAt,
      }));

      return {
        skills: {
          languages,
          coreMetrics,
        },
        badges: formattedBadges,
      };
    } catch (error) {
      console.error("❌ [SkillService] getUserProfileData Error:", error);
      throw new Error("ดึงข้อมูลโปรไฟล์ล้มเหลว");
    }
  },

  async getProfileData(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { githubAccessToken: true },
    });

    if (!user || !user.githubAccessToken) {
      throw new Error("GITHUB_TOKEN_NOT_FOUND");
    }
    console.log("Hello form github");
    try {
      const githubResponse = await axios.get("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${user.githubAccessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      });
      console.log("Github Response: ", githubResponse.data);

      return {
        username: githubResponse.data.login,
        name: githubResponse.data.name,
        avatarUrl: githubResponse.data.avatar_url,
        bio: githubResponse.data.bio,
        publicRepos: githubResponse.data.public_repos,
        followers: githubResponse.data.followers,
        githubUrl: githubResponse.data.html_url,
      };
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error("GITHUB_TOKEN_EXPIRED");
      }
      throw new Error("GITHUB_API_ERROR");
    }
  },
  async getPublicProjectData(projectId: string) {
    const project = await prisma.userProject.findFirst({
      where: { mongoProjectId: projectId },
      include: {
        user: {
          select: {
            name: true,
            githubId: true,
          },
        },
        projectAnalysis: true,
        projectSkills: true,
        badges: {
          include: {
            badge: true,
          },
        },
      },
    });

    if (!project) return null;

    const analysis = project.projectAnalysis;

    return {
      userData: {
        name: project.user?.name || "Unknown User",
        avatarUrl: project.user?.githubId
          ? `https://avatars.githubusercontent.com/${project.user.githubId}`
          : null,
      },
      currentViewData: {
        score: analysis?.final_score || 0,
        grade: analysis?.grade || "N/A",
        insight: analysis?.insight || "ยังไม่มีข้อมูลสรุปสำหรับโปรเจกต์นี้",

        metrics: project.projectSkills
          .filter((skill) => skill.category.toLowerCase() !== "language")
          .map((skill) => ({
            skill_name: skill.skill_name,
            points: skill.points,
          })),

        languages: project.projectSkills
          .filter((skill) => skill.category.toLowerCase() === "language")
          .map((skill) => ({
            skill_name: skill.skill_name,
          })),

        sources: [
          {
            name: project.projectName,
            url: "#",
            desc: "Main Repository",
          },
        ],
      },
      badges: project.badges.map((pb) => pb.badge),
    };
  },
};

export default SkillService;
