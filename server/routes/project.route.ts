import { Router } from "express";
import ProjectController from "../controllers/project.controller.js";
import verifyToken from "../middleware/verifyToken.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: API สำหรับการจัดการโปรเจกต์ของผู้ใช้งาน
 */

/**
 * @swagger
 * /project/{groupName}:
 *   get:
 *     summary: ดึงข้อมูลโปรเจกต์ตามชื่อกลุ่ม (Group Name)
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: groupName
 *         required: true
 *         schema:
 *           type: string
 *         description: ชื่อของกลุ่มหรือโปรเจกต์ที่ต้องการดึงข้อมูล
 *     responses:
 *       200:
 *         description: คืนค่าข้อมูลโปรเจกต์ที่ระบุ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "proj_12345"
 *                 name:
 *                   type: string
 *                   example: "My Awesome Project"
 *                 groupName:
 *                   type: string
 *                   example: "frontend-team"
 *       404:
 *         description: ไม่พบโปรเจกต์
 */

router.get('/:groupName', ProjectController.getProject)

/**
 * @swagger
 * /project/:
 *   get:
 *     summary: ดึงข้อมูลโปรเจกต์ทั้งหมดของผู้ใช้งาน
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: คืนค่า Array รายการโปรเจกต์ทั้งหมดของผู้ใช้
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "proj_12345"
 *                   name:
 *                     type: string
 *                     example: "My Awesome Project"
 */
router.get('/', ProjectController.getAllUserProjects);

/**
 * @swagger
 * /project/:
 *   post:
 *     summary: สร้างโปรเจกต์ใหม่
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: ชื่อโปรเจกต์
 *                 example: "New App Development"
 *               description:
 *                 type: string
 *                 description: รายละเอียดโปรเจกต์
 *                 example: "โปรเจกต์สำหรับสร้างแอปพลิเคชันใหม่"
 *     responses:
 *       201:
 *         description: สร้างโปรเจกต์สำเร็จ
 *       400:
 *         description: ส่งข้อมูลมาไม่ครบถ้วนหรือไม่ถูกต้อง
 */
router.post('/', ProjectController.handleCreateProject)

/**
 * @swagger
 * /project/{id}:
 *   delete:
 *     summary: ลบโปรเจกต์ (จำเป็นต้องยืนยันตัวตน)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: [] 
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID ของโปรเจกต์ที่ต้องการลบ
 *     responses:
 *       200:
 *         description: ลบโปรเจกต์สำเร็จ
 *       401:
 *         description: Unauthorized (ไม่มี Token หรือ Token หมดอายุ)
 *       403:
 *         description: Forbidden (ไม่มีสิทธิ์ลบโปรเจกต์นี้)
 *       404:
 *         description: ไม่พบโปรเจกต์ที่ต้องการลบ
 */
router.delete('/:id',verifyToken, ProjectController.deleteUserProject);

export default router;
