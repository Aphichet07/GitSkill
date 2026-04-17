import { Router } from "express";
import AnalysisController from "../controllers/analysis.controller.js";

const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({ message: "Hello From Analysis" });
});

export default router;
