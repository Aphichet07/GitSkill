import { Router } from "express";
import AuthRoute from "./auth.route.js";
import RepoRoute from "./repo.route.js"
import ProjectRoute from "./project.route.js"

const router = Router();

router.use('/auth', AuthRoute);
router.use('/repo', RepoRoute)
router.use('/project', ProjectRoute)

export default router;