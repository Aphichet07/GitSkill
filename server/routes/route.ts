import { Router } from "express";
import AuthRoute from "./auth.route.js";

const router = Router();

router.use('/auth', AuthRoute);

export default router;