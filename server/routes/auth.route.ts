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
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  AuthController.handleCallbackGoogle 
);
export default router;