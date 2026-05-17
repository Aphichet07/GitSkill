import type { Request, Response } from "express";
import AnalysisService from "../services/analysis.service.js";

const AnalysisController = {
  async analyzeProjectHandler(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      if (!id || typeof id !== "string" || isNaN(userId)) {
        return res
          .status(400)
          .json({ message: "Missing or invalid Project ID or User ID" });
      }

      const result = await AnalysisService.analyzeProject(id, userId);

      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  async handleGetAnalyze(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = Number(req.query.userId);

      if (!id || typeof id !== "string") {
        return res
          .status(400)
          .json({ message: "Missing or invalid Project ID or User ID" });
      }

      const data = await AnalysisService.getAnalyze(id, Number(userId))

      res.status(200).json({messsge: "Success", success: true,data: data})
    } catch (err: any) {
      console.log(err.message);
      res.status(500).json({ message: err.message });
    }
  },
  

};

export default AnalysisController;
