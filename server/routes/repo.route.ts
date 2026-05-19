import { Router } from "express";
import RepoController from "../controllers/repo.controller.js";
import verifyToken from "../middleware/verifyToken.js";
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Repositories
 *   description: API สำหรับการจัดการและดึงข้อมูล Git Repositories
 */

/**
 * @swagger
 * /repo/test:
 *   get:
 *     summary: ทดสอบการทำงานของ Repositories Router
 *     tags: [Repositories]
 *     responses:
 *       200:
 *         description: สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Welcome To Repositories!
 */
router.get("/test", (req, res) => {
  res.status(200).json({ message: "Welcome To Repositories!" });
});

/**
 * @swagger
 * /repo/:
 *   get:
 *     summary: ดึงข้อมูล Repositories ทั้งหมดของผู้ใช้งาน
 *     tags: [Repositories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: คืนค่ารายการ Repositories ทั้งหมด
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                     example: my-awesome-repo
 *       401:
 *         description: Unauthorized (ไม่ได้แนบ Token หรือ Token ไม่ถูกต้อง)
 */
router.get("/", verifyToken, RepoController.GetRepos);

/**
 * @swagger
 * /repo/me:
 *   get:
 *     summary: ดึงข้อมูลส่วนตัวของผู้ใช้งานในบริบทของ Repository
 *     tags: [Repositories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: คืนค่าข้อมูลผู้ใช้งาน
 *       401:
 *         description: Unauthorized
 */
router.get("/me" ,verifyToken, RepoController.getUser)

/**
 * @swagger
 * /repo/{owner}/{repoName}/full-code:
 *   get:
 *     summary: ดึง Source Code ทั้งหมดของ Repository
 *     tags: [Repositories]
 *     parameters:
 *       - in: path
 *         name: owner
 *         required: true
 *         schema:
 *           type: string
 *         description: ชื่อเจ้าของ Repository (เช่น username หรือ organization)
 *       - in: path
 *         name: repoName
 *         required: true
 *         schema:
 *           type: string
 *         description: ชื่อ Repository
 *     responses:
 *       200:
 *         description: ดึงข้อมูล Code ทั้งหมดสำเร็จ
 *       404:
 *         description: ไม่พบ Repository ที่ระบุ
 */
router.get("/:owner/:repoName/full-code", RepoController.GetFullRepoCode);

/**
 * @swagger
 * /repo/{repoName}/content:
 *   get:
 *     summary: ดึงข้อมูลเนื้อหาของไฟล์ใน Repository
 *     tags: [Repositories]
 *     parameters:
 *       - in: path
 *         name: repoName
 *         required: true
 *         schema:
 *           type: string
 *         description: ชื่อ Repository
 *       - in: query
 *         name: path
 *         schema:
 *           type: string
 *         description: Path ของไฟล์ที่ต้องการอ่านเนื้อหา (ระบุผ่าน Query String)
 *     responses:
 *       200:
 *         description: คืนค่าเนื้อหาของไฟล์
 *       404:
 *         description: ไม่พบไฟล์หรือ Repository
 */
router.get("/:repoName/content", RepoController.GetFileContent)

/**
 * @swagger
 * /repo/{repoName}:
 *   get:
 *     summary: ดึงข้อมูลรายละเอียดของ Repository
 *     tags: [Repositories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: repoName
 *         required: true
 *         schema:
 *           type: string
 *         description: ชื่อ Repository
 *     responses:
 *       200:
 *         description: คืนค่าข้อมูล Metadata/รายละเอียด ของ Repository
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: my-awesome-repo
 *                 description:
 *                   type: string
 *                   example: "โปรเจกต์สำหรับจัดการระบบ..."
 *                 isPrivate:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: ไม่พบ Repository
 */
router.get("/:repoName", verifyToken, RepoController.RepoInformation);

/**
 * @swagger
 * /repo/{repoName}/tree:
 *   get:
 *     summary: ดึงโครงสร้างไฟล์และโฟลเดอร์ (File Tree) ของ Repository
 *     tags: [Repositories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: repoName
 *         required: true
 *         schema:
 *           type: string
 *         description: ชื่อ Repository
 *     responses:
 *       200:
 *         description: คืนค่าโครงสร้าง Tree ของ Repository
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   path:
 *                     type: string
 *                     example: "src/index.ts"
 *                   type:
 *                     type: string
 *                     example: "blob"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: ไม่พบ Repository
 */
router.get("/:repoName/tree", verifyToken, RepoController.RepoTree);

export default router;
