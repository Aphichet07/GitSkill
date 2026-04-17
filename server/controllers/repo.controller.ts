import type { Request, Response } from "express";
import RepoService from "../services/repo.service.js";

const RepoController = {
  async getUser(req: Request, res: Response) {
    const userId = req.userPayload?.userId;
    console.log("userId --> ", userId);
    const user = await RepoService.findUser(userId!);
    console.log("User Here ---> ", user);

    const username = await RepoService.getusername(user.githubAccessToken!);
    res.status(200).json({ message: "success", data: username });
  },

  async GetRepos(req: Request, res: Response) {
    try {
      const userId = req.userPayload?.userId;
      const user = await RepoService.findUser(userId!);
      console.log("User Here ---> ", user);

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
      const userId = req.userPayload?.userId;
      const { repoName } = req.params;

      if (!repoName || typeof repoName !== "string") {
        return res.status(400).json({ message: "Invalid Repository Name" });
      }

      const user = await RepoService.findUser(userId!);

      if (!user || !user.githubAccessToken) {
        return res.status(400).json({
          message:
            "GitHub Access Token not found. Please login with GitHub again.",
        });
      }

      const data = await RepoService.InformRepo(
        user.githubAccessToken!,
        repoName,
      );
      console.log(data);
      res.status(200).json({ message: "Success", data: data });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err });
    }
  },

  async RepoTree(req: Request, res: Response) {
    try {
      const userId = req.userPayload?.userId;
      const { repoName } = req.params;

      if (!repoName || typeof repoName !== "string") {
        return res.status(400).json({ message: "Invalid Repository Name" });
      }

      const user = await RepoService.findUser(userId!);

      if (!user || !user.githubAccessToken) {
        return res.status(400).json({
          message:
            "GitHub Access Token not found. Please login with GitHub again.",
        });
      }
      const data = await RepoService.RepoTree(
        user.githubAccessToken!,
        repoName,
      );
      res.status(200).json({meessage: "Success", data: data})
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err });
    }
  },
};

export default RepoController;
