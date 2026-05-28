import type { Request, Response } from "express";
import SkillService from "../services/skill.service.js";

const SkillController = {
  async GetUserSkills(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || (req as any).userPayload?.userId;
      // const userId = 2;
      if (!userId) {
        return res
          .status(401)
          .json({ error: "ไม่พบข้อมูลผู้ใช้งาน (Unauthorized)" });
      }

      const skillData = await SkillService.getUserSkills(userId);

      return res.status(200).json({
        success: true,
        data: skillData,
      });
    } catch (error: any) {
      console.error("❌ [SkillController] GetUserSkills Error:", error);
      return res.status(500).json({
        success: false,
        error: "ดึงข้อมูลสกิลไม่สำเร็จ",
        message: error.message,
      });
    }
  },
  async GetUserProfile(req: Request, res: Response) {
    try {
      // const userId = (req as any).user?.id || (req as any).userPayload?.userId;
      const userId = 2;
      if (!userId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      const profileData = await SkillService.getUserProfileData(userId);

      return res.status(200).json({
        success: true,
        data: profileData,
      });
    } catch (error: any) {
      console.error("❌ [SkillController] Error:", error.message);
      return res.status(500).json({
        success: false,
        error: "ไม่สามารถดึงข้อมูลโปรไฟล์ได้",
      });
    }
  },
  async GetGithubProfile(req: Request, res: Response) {
    try {
      const userId = req.userPayload?.userId;

      if (!userId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      // เรียกใช้ Service
      const profileData = await SkillService.getProfileData(userId);

      // ตอบกลับผลลัพธ์
      return res.status(200).json({
        success: true,
        data: profileData,
      });
      
    } catch (error: any) {
      console.error("❌ [GithubController] Error:", error.message);

      // แปลง Error จาก Service เป็น HTTP Status ที่เหมาะสม
      if (error.message === "GITHUB_TOKEN_NOT_FOUND") {
        return res.status(404).json({ 
          success: false, 
          error: "ไม่พบ GitHub Token กรุณาเชื่อมต่อ GitHub ก่อน" 
        });
      }
      
      if (error.message === "GITHUB_TOKEN_EXPIRED") {
        return res.status(401).json({ 
          success: false, 
          error: "GitHub Token หมดอายุหรือไม่ถูกต้อง (Unauthorized)" 
        });
      }

      return res.status(500).json({ 
        success: false, 
        error: "เกิดข้อผิดพลาดในการดึงข้อมูลจาก GitHub" 
      });
    }
  },
};

export default SkillController;
