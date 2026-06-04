import { Router } from "express";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import AuthController from "../controllers/auth.controller.js";
import passport from "../lib/passport.js";
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: API สำหรับการจัดการ Authentication
 */
/**
 * @swagger
 * /auth/:
 *   get:
 *     summary: เช็คการทำงานของ Auth Router
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: ยินดีต้อนรับสู่ระบบ Auth
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Welcome to auth
 */
router.get("/", (req, res) => {
  res.json({ message: "Welcome to auth" });
});

/**
 * @swagger
 * /auth/status:
 *   get:
 *     summary: ตรวจสอบสถานะการเข้าสู่ระบบปัจจุบัน (เช็คจาก Cookie Token)
 *     tags: [Auth]
 *     parameters:
 *       - in: cookie
 *         name: token
 *         schema:
 *           type: string
 *         description: JWT Token สำหรับยืนยันตัวตน
 *     responses:
 *       200:
 *         description: คืนค่าสถานะ Auth และข้อมูลผู้ใช้
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isAuthenticated:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   type: object
 *                   description: ข้อมูลผู้ใช้ที่แกะมาจาก JWT Token (จะส่งเป็น null ถ้าไม่ได้ล็อกอิน)
 */
router.get("/status", (req: Request, res: Response) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(200).json({
        isAuthenticated: false,
        user: null,
      });
    }

    const decodedUser = jwt.verify(token, process.env.JWT_SECRET as string) as any;

    return res.status(200).json({
      isAuthenticated: true,
      isGithubConnected: decodedUser.provider === "github", 
      user: decodedUser,
    });
  } catch (error) {
    return res.status(200).json({
      isAuthenticated: false,
      user: null,
    });
  }
});

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: สมัครสมาชิกใหม่ด้วย Email / Password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: P@ssw0rd123
 *     responses:
 *       201:
 *         description: สมัครสมาชิกสำเร็จ
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 */

router.post("/register", AuthController.handleRegister);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: เข้าสู่ระบบด้วย Email / Password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: P@ssw0rd123
 *     responses:
 *       200:
 *         description: เข้าสู่ระบบสำเร็จ (โดยปกติจะฝัง JWT กลับมาใน Cookie)
 *       401:
 *         description: อีเมลหรือรหัสผ่านไม่ถูกต้อง
 */
router.post("/login", AuthController.handleLogin);

/**
 * @swagger
 * /auth/google/auth:
 *   get:
 *     summary: กดปุ่ม Login ด้วย Google (จะ Redirect ไปหน้า Google)
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirects ไปที่หน้า Consent Screen ของ Google
 */
router.get(
  "/google/auth",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Callback Route สำหรับ Google OAuth (ระบบจัดการอัตโนมัติ ห้ามยิง API ด้วยตัวเอง)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: จัดการและสร้าง JWT Token เมื่อ Google ส่งข้อมูลกลับมาสำเร็จ
 *       302:
 *         description: หากมีข้อผิดพลาดจะ Redirect กลับไปหน้า Login
 */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  AuthController.handleCallbackGoogle,
);

/**
 * @swagger
 * /auth/github:
 *   get:
 *     summary: กดปุ่ม Login ด้วย GitHub (จะ Redirect ไปหน้า GitHub)
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirects ไปที่หน้า Consent Screen ของ GitHub
 */
router.get(
  "/github",
  passport.authenticate("github", {
    scope: ["user:email", "repo"],
    session: false,
  }),
);

/**
 * @swagger
 * /auth/github/callback:
 *   get:
 *     summary: Callback Route สำหรับ GitHub OAuth (ระบบจัดการอัตโนมัติ ห้ามยิง API ด้วยตัวเอง)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: จัดการและสร้าง JWT Token เมื่อ GitHub ส่งข้อมูลกลับมาสำเร็จ
 *       302:
 *         description: หากมีข้อผิดพลาดจะ Redirect กลับไปหน้า Login
 */
router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    AuthController.handleCallbackGitHub(req, res);
  },
);

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return res.status(200).json({
    success: true,
    message: "ออกจากระบบสำเร็จ",
  });
});
export default router;
