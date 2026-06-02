import express from "express"
import verifyToken from "../middleware/verifyToken.js";
import SkillController from "../controllers/user.controller.js";

const router = express.Router()

router.get("/skills",  SkillController.GetUserSkills);
router.get("/public/skills", SkillController.GetUserSkills);
router.get("/public/github/profile", SkillController.GetGithubProfile);
router.get("/public/profile/:userId",  SkillController.GetPublicUserProfile);
router.get("/public/project/:projectId", SkillController.GetPublicProjectReport);


router.use(verifyToken);
router.get("/github/profile", SkillController.GetGithubProfile);
router.get("/skills",  SkillController.GetUserSkills);
router.get("/profile", SkillController.GetUserProfile);

export default router