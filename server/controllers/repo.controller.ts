import type { Request, Response } from "express";
import RepoService from "../services/repo.service.js";

const RepoController = {
  async getUser(req: Request, res: Response) {
    const userId = req.userPayload?.userId;
    const user = await RepoService.findUser(userId!);

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

  async GetFileContent(req: Request, res: Response) {
    try {
      const userId = req.userPayload?.userId;
      const { repoName } = req.params; // เช่น "Project-X" หรือ "owner/Project-X"
      const { filePath } = req.query; // รับ path ของไฟล์ เช่น "src/index.ts"

      if (!repoName || typeof repoName !== "string") {
        return res.status(400).json({ message: "Invalid Repository Name" });
      }

      if (!filePath || typeof filePath !== "string") {
        return res.status(400).json({ message: "File path is required" });
      }

      const user = await RepoService.findUser(userId!);

      if (!user || !user.githubAccessToken) {
        return res.status(400).json({
          message: "GitHub Access Token not found. Please login with GitHub again.",
        });
      }

      const username = await RepoService.getusername(user.githubAccessToken);

      const fileData = await RepoService.fetchFileContent(
        user.githubAccessToken!,
        username,
        repoName,
        filePath
      );

      res.status(200).json({ message: "Success", data: fileData });
    } catch (err: any) {
      console.log("GetFileContent Error:", err);
      res.status(err.response?.status || 500).json({ 
        message: err.response?.data?.message || err.message || "Internal Server Error" 
      });
    }
  },
  async GetFullRepoCode(req: Request, res: Response) {
    try {
      const userId = req.query.userId as string;
      
      const { owner, repoName } = req.params;

      if (!owner || typeof owner !== "string") {
        return res.status(400).json({ message: "Invalid Owner Name" });
      }

      if (!repoName || typeof repoName !== "string") {
        return res.status(400).json({ message: "Invalid Repository Name" });
      }

      if (!userId || typeof userId !== "string") {
        return res.status(400).json({ message: "Invalid Repository Name" });
      }

      const numericUserId = parseInt(userId, 10);

      if (isNaN(numericUserId)) {
        return res.status(400).json({ message: "User ID must be a number" });
      }
      console.log("numericUserId --> ",numericUserId)
      const user = await RepoService.findUser(numericUserId);
      console.log("user ->", user.githubAccessToken)
      if (!user || !user.githubAccessToken) {
        return res.status(400).json({
          message: "GitHub Access Token not found. Please login with GitHub again.",
        });
      }

      console.log("-----> ",owner, repoName)
      const fullCode = await RepoService.getFullRepoCode(
        user.githubAccessToken,
        owner,
        repoName
      );

      res.status(200).json({ 
        message: "Success", 
        data: fullCode 
      });

    } catch (err: any) {
      console.error("GetFullRepoCode Error:", err);
      res.status(err.response?.status || 500).json({ 
        message: err.response?.data?.message || err.message || "Internal Server Error" 
      });
    }
  },
};

export default RepoController;
