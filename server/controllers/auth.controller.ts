import type { Request, Response } from "express";
import AuthService from "../services/auth.service.js";

const AuthController = {
  async handleRegister(req: Request, res: Response) {
    try {
      const { email, password, username } = req.body;
      if (!email || !password || !username) {
        res.status(400).json({ message: " ข้อมูลไม่ครบ " });
      }
      const user: any = await AuthService.register(email, password, username);

      if (!user) {
        return res.status(500).json({ message: "ไม่สามารถสร้างบัญชีได้" });
      }

      res.status(201).json({message: "Register Success", success: true, data: user})
    } catch (err) {
      console.log("log kuy"+err);
      res.status(500).json({ message: err });
    }
  },
  
  async handleLogin(req : Request, res: Response){
    try {
      const { email, password} = req.body
      if (!email || !password){
        return res.status(400).json({message : "ส่งข้อมูลมาไม่ครบ"})
      }
      const user: any = await AuthService.login(email, password)
      if (!user){
        res.status(500).json({message: "ไม่มี user นี้ในระบบ"})
      }
      res.status(200).json({message: "Login Success", success: true, data: user})
    }catch(err){
      console.log(err)
      res.status(500).json({message: err})
    }
  },
};

export default AuthController;
