import connectMongo from "../lib/mongo.js";
import { RepoGroup } from "../models/RepoGroup.js";
import type { IRepoGroup } from '../models/RepoGroup.js';
import { Types } from "mongoose";

interface CreateProjectParams {
  groupName: string;
  selectedRepos: string[]; // เช่น ["owner/repo-a", "owner/repo-c"]
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
  async getAllProjects(userId: number): Promise<IRepoGroup[]> {
    try {
      return await RepoGroup.find({ userId }).sort({ createdAt: -1 }).lean();
    } catch (error) {
      throw new Error("Could not fetch projects");
    }
  },
  async deleteProject(groupId: string, userId: number): Promise<boolean> {
    try {
      const result = await RepoGroup.deleteOne({ _id: groupId, userId });
      return result.deletedCount > 0;
    } catch (error) {
      throw new Error('Error deleting project');
    }
  }
};

export default ProjectService;
