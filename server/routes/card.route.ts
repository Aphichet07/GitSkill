import express from "express"
import CardController from "../controllers/card.controller.js"

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Cards
 *   description: API สำหรับการจัดการข้อมูลและการแสดงผล Card
 */

/**
 * @swagger
 * /card/public/{userId}:
 *   get:
 *     summary: ทดสอบหรือดึงข้อมูลการ์ดสาธารณะของผู้ใช้งาน (Public Cards)
 *     tags: [Cards]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID ของผู้ใช้งานที่ต้องการดูข้อมูลการ์ดสาธารณะ
 *     responses:
 *       200:
 *         description: คืนค่าข้อมูลการ์ดสาธารณะสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   description: รายละเอียดข้อมูลการ์ด
 *       404:
 *         description: ไม่พบข้อมูลผู้ใช้งาน หรือผู้ใช้งานรายนี้ไม่มีการ์ดสาธารณะ
 */
router.get("/public/:userId", CardController.test)

export default router