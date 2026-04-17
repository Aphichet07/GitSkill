import { Router } from "express";
import AuthRoute from "./auth.route.js";
import RepoRoute from "./repo.route.js"

const router = Router();

router.use('/auth', AuthRoute);
router.use('/repo', RepoRoute)

export default router;