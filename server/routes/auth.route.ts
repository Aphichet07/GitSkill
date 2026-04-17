import { Router } from "express";
import AuthController from "../controllers/auth.controller.js";
import passport from "../lib/passport.js"
const router = Router();

router.get('/', (req, res)=>{
    res.json({message:"Welcome to auth"})
})
router.post('/register', AuthController.handleRegister);
router.post('/login', AuthController.handleLogin)
router.get(
  '/google/auth', 
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);
router.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  AuthController.handleCallbackGoogle 
);

router.get(
  '/auth/github',
  passport.authenticate('github', { 
    scope: ['user:email', 'repo'], 
    session: false 
  })
);

router.get(
  '/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login', session: false }),
  (req, res) => {
    // ล็อกอินผ่านแล้ว ทำการ Redirect หรือออก JWT เหมือนเดิมได้เลยครับ
    // เช่น res.redirect('http://localhost:3000/dashboard');
    AuthController.handleCallbackGitHub(req, res); // หรือส่งเข้า Controller ของคุณ
  }
);
export default router;