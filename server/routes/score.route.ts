import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import { ScoreController } from "../controllers/score.controller.js";



const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Analysis
 *   description: API สำหรับการวิเคราะห์โปรเจกต์และการประเมินคะแนน
 */

/**
 * @swagger
 * /{projectId}/analyze:
 *   get:
 *     summary: วิเคราะห์ซอร์สโค้ดและประเมินคะแนนของโปรเจกต์
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID ของโปรเจกต์ที่ต้องการวิเคราะห์
 *     responses:
 *       200:
 *         description: วิเคราะห์สำเร็จและคืนค่าผลลัพธ์/คะแนน
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 score:
 *                   type: number
 *                   example: 85.5
 *                 issuesFound:
 *                   type: integer
 *                   example: 12
 *                 details:
 *                   type: string
 *                   example: "พบปัญหาเรื่อง Code Smell เล็กน้อย..."
 *       401:
 *         description: Unauthorized (ไม่มี Token หรือ Token หมดอายุ)
 *       404:
 *         description: ไม่พบโปรเจกต์ที่ระบุ
 */
router.get(
  "/projects/:userProjectId/status", 
  verifyToken,                 
  ScoreController.CheckAnalysisStatus
);

router.get("/test", (req, res)=>{
    res.status(200).json({ message: "Welcome To Score!" });
})

/**
 * @swagger
 * /score/group/{userProjectId}:
 *   post:
 *     summary: วิเคราะห์โปรเจกต์แบบกลุ่ม (Group Analysis)
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userProjectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID ของ User Project ที่ต้องการวิเคราะห์ร่วมกับกลุ่ม
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: ข้อมูลเพิ่มเติมสำหรับการวิเคราะห์กลุ่ม (ถ้ามี)
 *             properties:
 *               options:
 *                 type: object
 *                 example: { "depth": "full", "includeMetrics": true }
 *     responses:
 *       200:
 *         description: วิเคราะห์กลุ่มสำเร็จ
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: ไม่พบ User Project
 */
router.post("/group/:userProjectId", verifyToken,ScoreController.AnalyzeGroup);

export default router