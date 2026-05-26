import type { Request, Response } from "express";
import { Queue } from "bullmq";
import { redisConnection } from "../lib/redis.js";
import ScoreService from "../services/score.service.js"
const analysisQueue = new Queue("ProjectAnalysisQueue", { connection: redisConnection });

export const ScoreController = {
  async AnalyzeGroup(req: Request, res: Response) {
    try {
      const mongoProjectId = req.params.userProjectId as string;
      const userId = req.userPayload?.userId;
      console.log("Hello")
      if (!userId || !mongoProjectId) {
        return res.status(400).json({ error: "Missing Required Parameters." });
      }

      const job = await analysisQueue.add(
        "analyze-repo-group",
        { userId, mongoProjectId }, 
        {
          jobId: `analyze-${mongoProjectId}`, 
          removeOnComplete: 100, 
          removeOnFail: 500,   
          attempts: 2,         
        }
      );

      return res.status(202).json({
        message: "ระบบกำลังวิเคราะห์ Portfolio ของคุณอยู่เบื้องหลัง...",
        jobId: job.id,
        status: "processing"
      });
    } catch (err: any) {
      console.error("Queue Error:", err);
      return res.status(500).json({ error: "Failed to enqueue analysis job." });
    }
  },
  async CheckAnalysisStatus(req: Request, res: Response) {
    try {
      const mongoProjectId = req.params.userProjectId as string;
      const userId = req.query.userId as string;
      console.log("In Controller")
      if (!userId || !mongoProjectId) {
        return res.status(400).json({ error: "Missing Required Parameters." });
      }

      // เรียกใช้งาน Service อย่างสะอาดตา
      const result = await ScoreService.getAnalysisResult(userId, mongoProjectId);

      // ตอบกลับ 200 OK พร้อมข้อมูล
      return res.status(200).json(result);

    } catch (err: any) {
      // จัดการ Error ตามที่ Service โยนออกมา
      if (err.message.includes("NOT_FOUND")) {
        return res.status(404).json({ error: err.message });
      }
      
      console.error("Check Status Error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
};