import { Router } from "express";
import AuthRoute from "./auth.route.js";
import RepoRoute from "./repo.route.js"
import ProjectRoute from "./project.route.js"
import AnalysisRoute from "./analysis.route.js"
import ScoreRoutes from "./score.route.js"
const router = Router();

router.use('/auth', AuthRoute);
router.use('/repo', RepoRoute)
router.use('/project', ProjectRoute)
router.use('/analysis', AnalysisRoute)
router.use("/score", ScoreRoutes);
export default router;