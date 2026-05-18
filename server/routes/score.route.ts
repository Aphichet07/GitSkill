import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import ScoreController from "../controllers/score.controller.js";
const router = express.Router();

router.get("/:projectId/analyze", verifyToken,ScoreController.Analysis)
router.post("/group/:userProjectId", verifyToken,ScoreController.AnalyzeGroup);

export default router