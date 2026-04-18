import { Router } from "express";
import ProjectController from "../controllers/project.controller.js";

const router = Router();

router.get('/:groupName', ProjectController.getProject)
router.get('/', ProjectController.getAllUserProjects);
router.post('/', ProjectController.handleCreateProject)
router.delete('/:id', ProjectController.deleteUserProject);

export default router;
