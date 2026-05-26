import connectMongo from "../lib/mongo.js";
import { RepoGroup } from "../models/RepoGroup.js";
import type { IRepoGroup } from "../models/RepoGroup.js";
import { Types } from "mongoose";
import { prisma } from "../lib/prisma.js";

interface CreateProjectParams {
  groupName: string;
  selectedRepos: string[];
  userId: number;
}

const ProjectService = {
  async createProject({
    groupName,
    selectedRepos,
    userId,
  }: CreateProjectParams) {
    try {
      const existingGroup = await RepoGroup.findOne({ groupName, userId });
      if (existingGroup) {
        throw new Error("You already have a group with this name.");
      }

      const newGroup = new RepoGroup({
        groupName,
        repos: selectedRepos,
        userId,
      });

      const savedGroup = await newGroup.save();

      try {
        await prisma.userProject.create({
          data: {
            userId: Number(userId),
            mongoProjectId: savedGroup._id.toString(),
            projectName: groupName,
          },
        });
        console.log(
          `ซิงค์โปรเจกต์ลง Postgres สำเร็จ (Mongo ID: ${savedGroup._id})`,
        );
      } catch (prismaError) {
        console.error("บันทึกลง Postgres ไม่สำเร็จ:", prismaError);
      }

      return savedGroup;
    } catch (error) {
      console.error("Error in createProject Service:", error);
      throw error;
    }
  },

  async getProjectByName(groupName: string, userId: number) {
    try {
      const group = await RepoGroup.findOne({ groupName, userId }).lean();
      if (!group) return null;

      return group;
    } catch (error) {
      throw new Error("Error fetching project");
    }
  },

  async getAllProjects(userId: number): Promise<any[]> {
    try {
      const projects = await RepoGroup.find({ userId })
        .sort({ createdAt: -1 })
        .lean();

      const pgProjects = await prisma.userProject.findMany({
        where: { userId: Number(userId) },
        select: {
          mongoProjectId: true,
          projectAnalysis: { 
            select: { grade: true } 
          }
        }
      });

      const projectsWithStatus = projects.map((project) => {
        const matchedPgProject = pgProjects.find(
          (pg) => pg.mongoProjectId === project._id.toString()
        );

        return {
          ...project,
          isAnalyzed: !!project.isAnalyzed || false,
          grade: matchedPgProject?.projectAnalysis?.grade || null, 
        };
      });


      return projectsWithStatus;
    } catch (error) {
      console.error("Error fetching projects:", error);
      throw new Error("Could not fetch projects");
    }
  },

  async deleteProject(groupId: string, userId: number): Promise<boolean> {
    try {
      const result = await RepoGroup.deleteOne({ _id: groupId, userId });

      if (result.deletedCount > 0) {
        try {
          await prisma.userProject.deleteMany({
            where: {
              mongoProjectId: groupId,
              userId: userId,
            },
          });
          console.log(`ลบโปรเจกต์ออกจาก Postgres สำเร็จ`);
        } catch (prismaErr) {
          console.error("ลบข้อมูลออกจาก Postgres ไม่สำเร็จ:", prismaErr);
        }
      }

      return result.deletedCount > 0;
    } catch (error) {
      throw new Error("Error deleting project");
    }
  },
};

export default ProjectService;
