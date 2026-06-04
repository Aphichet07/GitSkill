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
      // 1. ดักจับ ID จาก URL Parameter (กรณีหน้า Public ยิงมาแบบ /project/:projectId)
      // หรือดักจาก Query (กรณีค้นหาแบบเดิม)
      const projectId = (req.params.projectId || req.params.id) as string;
      const groupName = req.query.groupName ? String(req.query.groupName) : "";
      const userId = req.query.userId ? String(req.query.userId) : "";

      let data;
      if (!projectId) {
        return res.status(400).json({
          success: false,
          message: "กรุณาระบุ projectId หรือ groupName",
        });
      }

      if (projectId) {
        // ถ้ามี projectId แนบมา ให้ใช้ฟังก์ชันค้นหาด้วย ID
        data = await ProjectService.getProjectById(projectId);
      } else if (groupName && userId) {
        // ถ้ามี query string มา ให้ใช้แบบเดิม
        data = await ProjectService.getProjectByName(groupName, Number(userId));
      } else {
        return res.status(400).json({
          success: false,
          message: "กรุณาระบุ projectId หรือ groupName",
        });
      }

      if (!data) {
        return res
          .status(404)
          .json({ success: false, message: "ไม่พบข้อมูลโปรเจกต์" });
      }

      // ✅ 2. เพิ่มคำสั่งส่ง Response กลับไปให้ Frontend
      return res.status(200).json({ success: true, data });
    } catch (err: any) {
      console.error("❌ Controller Error:", err.message);
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async deleteUserProject(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const userPayload = req.userPayload;

      const userId = Number(userPayload?.userId);

      console.log("User in Delete Project:", userPayload);

      if (!id || typeof id !== "string" || isNaN(userId)) {
        return res
          .status(400)
          .json({ message: "Missing or invalid Project ID or User ID" });
      }

      console.log("User in delete: ", userId);
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
