import express from "express"
import verifyToken from "../middleware/verifyToken.js";
import SkillController from "../controllers/user.controller.js";

const router = express.Router()

router.get("/skills", verifyToken, SkillController.GetUserSkills);
router.get("/profile", verifyToken, SkillController.GetUserProfile);
export default router