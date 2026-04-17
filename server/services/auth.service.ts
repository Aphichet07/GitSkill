import { prisma } from "../lib/prisma.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Resend } from "resend";
import dotenv from "dotenv";
import crypto from "crypto";
dotenv.config();
const resend = new Resend(process.env.RESEND_API_KEY);
console.log(process.env.RESEND_API_KEY)
const AuthService = {
  async register(email: string, password: string, username: string) {
    const saltRounds: number = parseInt(process.env.SALTROUND!);
    console.log("saltRounds" + saltRounds)
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw Error("Email นี้ถูกใช้งานแล้ว");
      return;
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const activationToken: string = crypto.randomBytes(32).toString("hex");
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newUser = await prisma.user.create({
      data: {
        email,
        name: username,
        password: hashedPassword,
        activationToken,
        tokenExpiresAt,
      },
    });
    const activationLink = `http://localhost:3000/api/auth/verify-email?token=${activationToken}`;

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: newUser.email,
      subject: "ยืนยันการสมัครสมาชิก",
      html: `
        <h1>ยินดีต้อนรับ!</h1>
        <p>กรุณากดลิงก์ด้านล่างเพื่อยืนยันบัญชีของคุณ (ลิงก์มีอายุ 24 ชั่วโมง)</p>
        <a href="${activationLink}" style="padding: 10px 20px; background: blue; color: white; text-decoration: none;">เปิดใช้งานบัญชี</a>
      `,
    });

    return {
      message: "สมัครสมาชิกสำเร็จ กรุณาตรวจสอบอีเมลเพื่อเปิดใช้งานบัญชี",
    };
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");

    const isPasswordValid = await bcrypt.compare(password, user.password!);
    if (!isPasswordValid) throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");

    if (!user.isVerified) {
      throw new Error("กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ");
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" },
    );

    const { password: _, activationToken, tokenExpiresAt, ...safeUser } = user;
    return { message: "เข้าสู่ระบบสำเร็จ", user: safeUser, accessToken: token };
  },

  async verifyEmail(token: string) {
    const user = await prisma.user.findUnique({
      where: { activationToken: token },
    });

    if (!user) throw new Error("ลิงก์ยืนยันไม่ถูกต้อง");
    if (user.tokenExpiresAt && user.tokenExpiresAt < new Date()) {
      throw new Error("ลิงก์ยืนยันหมดอายุแล้ว กรุณาขอลิงก์ใหม่");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        activationToken: null,
        tokenExpiresAt: null,
      },
    });

    return { message: "ยืนยันอีเมลสำเร็จ ตอนนี้คุณสามารถเข้าสู่ระบบได้แล้ว" };
  },
};

export default AuthService;
