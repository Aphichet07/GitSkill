import type { Request, Response } from "express";
import type { User as PrismaUser } from "@prisma/client";
import AuthService from "../services/auth.service.js";
import passport from "../lib/passport.js";

const AuthController = {
  async handleRegister(req: Request, res: Response) {
    try {
      const { email, password, username } = req.body;
      if (!email || !password || !username) {
        return res.status(400).json({ message: " ข้อมูลไม่ครบ " });
      }
      const user: any = await AuthService.register(email, password, username);

      if (!user) {
        return res.status(500).json({ message: "ไม่สามารถสร้างบัญชีได้" });
      }

      res
        .status(201)
        .json({ message: "Register Success", success: true, data: user });
    } catch (err) {
      console.log("log kuy" + err);
      res.status(500).json({ message: err });
    }
  },

  async handleLogin(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "ส่งข้อมูลมาไม่ครบ" });
      }
      const user: any = await AuthService.login(email, password);
      if (!user) {
        res.status(500).json({ message: "ไม่มี user นี้ในระบบ" });
      }
      res.cookie("token", user.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000, // 1 วัน
      });
      res
        .status(200)
        .json({ message: "Login Success", success: true, data: user });
    } catch (err: any) {
      console.log("[Login Error]:", err.message);

      const errorMessage = err.message || "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์";

      if (
        errorMessage === "อีเมลหรือรหัสผ่านไม่ถูกต้อง" ||
        errorMessage === "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ"
      ) {
        return res.status(401).json({ message: errorMessage });
      }
      res.status(500).json({ message: err });
    }
  },
  async handleLogout(req: Request, res: Response) {
    try {
      await AuthService.logout();

      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      return res.status(200).json({
        message: "ออกจากระบบสำเร็จ",
        success: true,
      });
    } catch (err) {
      console.error("Logout Error:", err);
      return res.status(500).json({ message: "เกิดข้อผิดพลาดในการออกจากระบบ" });
    }
  },
  handleCallbackGoogle: (req: Request, res: Response) => {
    const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

    res.redirect(`${FRONTEND_URL}/dashboard`);
  },

  handleCallbackGitHub: (req: Request, res: Response) => {
    const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
    console.log("FRONTEND_URL: ", FRONTEND_URL);
    try {
      if (!req.user) {
        return res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);
      }

      const user = req.user as PrismaUser;

      const token = AuthService.generateAuthToken(user);

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.redirect(`${FRONTEND_URL}/dashboard`);
    } catch (error) {
      console.error("GitHub Auth Callback Error:", error);
      res.redirect(`${FRONTEND_URL}/login?error=server_error`);
    }
  },
};

export default AuthController;
