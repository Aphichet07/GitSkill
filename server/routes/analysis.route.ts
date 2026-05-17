import { Router } from "express";
import AnalysisController from "../controllers/analysis.controller.js";

const router = Router();


router.get("/:id/analyze", AnalysisController.handleGetAnalyze)
router.post("/:id/analyze", AnalysisController.analyzeProjectHandler)

export default router;
