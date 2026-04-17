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
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  AuthController.handleCallbackGoogle 
);

router.get(
  '/github',
  passport.authenticate('github', { 
    scope: ['user:email', 'repo'], 
    session: false 
  })
);

router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: '/login', session: false }),
  (req, res) => {
    AuthController.handleCallbackGitHub(req, res); 
  }
);
export default router;