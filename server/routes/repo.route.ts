import { Router } from "express";
import RepoController from "../controllers/repo.controller.js"
const router = Router()

router.get('/test', (req, res)=>{
    res.status(200).json({message: "Welcome To Repositories!"})
})

router.get('/', RepoController.GetRepos)

export default router