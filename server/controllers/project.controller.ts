import type { Request, Response } from "express";
import ProjectService from "../services/project.service.js";

const ProjectController = {
  async getAllUserProjects(req: Request, res: Response) {
    try {
      const userId = Number(req.query.userId);

      if (isNaN(userId)) {
        return res.status(400).json({ message: "Valid User ID is required" });
      }

      const projects = await ProjectService.getAllProjects(userId);
      res.status(200).json({ success: true, data: projects });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err });
    }
  },

  async handleCreateProject(req: Request, res: Response) {
    try {
      const { groupName, selectedRepos, userId } = req.body;

      const project = await ProjectService.createProject({
        groupName,
        selectedRepos,
        userId,
      });

      return res.status(201).json({
        success: true,
        data: project,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },
  async getProject(req: Request, res: Response) {
    try {
      const groupName = req.query.groupName as string;
      const userId = req.query.userId as string;

      const data = await ProjectService.getProjectByName(
        groupName,
        Number(userId),
      );
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err });
    }
  },

  async deleteUserProject(req: Request, res: Response) {
    try {
      const { id } = req.params; 
      const userId = Number(req.body.userId); 

      if (!id || typeof id !== 'string' || isNaN(userId)) {
      return res
        .status(400)
        .json({ message: "Missing or invalid Project ID or User ID" });
    }

      const isDeleted = await ProjectService.deleteProject(id, userId);

      if (!isDeleted) {
        return res
          .status(404)
          .json({ message: "Project not found or unauthorized" });
      }

      res
        .status(200)
        .json({ success: true, message: "Project deleted successfully" });
    } catch (error: any) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  },
};

export default ProjectController;
