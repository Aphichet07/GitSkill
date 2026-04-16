import { Router } from "express";
import AuthController from "../controllers/auth.controller.js";

const router = Router();

router.get('/', (req, res)=>{
    res.json({message:"Welcome to auth"})
})
router.post('/register', AuthController.handleRegister);
router.post('/login', AuthController.handleLogin)

export default router;