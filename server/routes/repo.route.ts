import { Router } from "express";
import RepoController from "../controllers/repo.controller.js";
import verifyToken from "../middleware/verifyToken.js";
const router = Router();

router.get("/test", (req, res) => {
  res.status(200).json({ message: "Welcome To Repositories!" });
});

router.get("/", verifyToken, RepoController.GetRepos);
router.get("/me" ,verifyToken, RepoController.getUser)
router.get("/:repoName", verifyToken, RepoController.RepoInformation);
router.get("/:repoName/tree", verifyToken, RepoController.RepoTree);

export default router;
