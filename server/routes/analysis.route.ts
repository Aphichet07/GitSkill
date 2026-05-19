import { Router } from "express";
import AnalysisController from "../controllers/analysis.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Analysis
 *   description: API สำหรับการวิเคราะห์และดูผลลัพธ์ของโปรเจกต์
 */

/**
 * @swagger
 * /analysis/{id}/analyze:
 *   get:
 *     summary: ดึงข้อมูลผลการวิเคราะห์ของโปรเจกต์
 *     tags: [Analysis]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID ของโปรเจกต์ที่ต้องการดูผลการวิเคราะห์
 *     responses:
 *       200:
 *         description: คืนค่าผลการวิเคราะห์ของโปรเจกต์
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "completed"
 *                 score:
 *                   type: number
 *                   example: 92.5
 *                 report:
 *                   type: object
 *                   description: รายละเอียดผลการวิเคราะห์
 *       404:
 *         description: ไม่พบโปรเจกต์หรือยังไม่มีผลการวิเคราะห์
 */
router.get("/:id/analyze", AnalysisController.handleGetAnalyze)

/**
 * @swagger
 * /analysis/{id}/analyze:
 *   post:
 *     summary: สั่งรันการวิเคราะห์โปรเจกต์ใหม่
 *     tags: [Analysis]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID ของโปรเจกต์ที่ต้องการสั่งวิเคราะห์
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               force:
 *                 type: boolean
 *                 description: บังคับให้วิเคราะห์ใหม่แม้จะมีผลลัพธ์เดิมอยู่แล้วหรือไม่
 *                 example: true
 *     responses:
 *       200:
 *         description: สั่งวิเคราะห์สำเร็จ (หรือส่งผลลัพธ์การวิเคราะห์กลับมา)
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง หรือโปรเจกต์กำลังถูกวิเคราะห์อยู่
 *       404:
 *         description: ไม่พบโปรเจกต์
 */
router.post("/:id/analyze", AnalysisController.analyzeProjectHandler)

export default router;
