import type { Request, Response } from "express";
import RepoService from "../services/repo.service.js";

const RepoController = {
  async GetRepos(req: Request, res: Response) {
    try {
      const userId = req.userPayload?.userId;
      const user = await RepoService.findUser(userId!);

      if (!user || !user.githubAccessToken) {
        return res.status(400).json({
          message:
            "GitHub Access Token not found. Please login with GitHub again.",
        });
      }
      const repos = await RepoService.getUserRepos(user.githubAccessToken);
      res.json({
        message: "Successfully fetched GitHub repositories",
        data: repos,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err });
    }
  },

  async RepoInformation(req: Request, res: Response) {
    try {
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err });
    }
  },

  async RepoTree(req: Request, res: Response) {
    try {
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err });
    }
  },
};

export default RepoController;
