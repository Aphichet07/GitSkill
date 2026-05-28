import express from "express"
import verifyToken from "../middleware/verifyToken.js";
import SkillController from "../controllers/user.controller.js";

const router = express.Router()

router.get("/skills", verifyToken, SkillController.GetUserSkills);
router.get("/profile",  SkillController.GetUserProfile);
router.get("/github/profile", verifyToken, SkillController.GetGithubProfile);
export default router