import type { Request, Response } from "express"
import RepoService from "../services/repo.service.js"

const RepoController = {
    async GetRepos(req: Request, res: Response){
        try {
            
        }catch(err){
            console.log(err)
            res.status(500).json({message: err})
        }
    },
}

export default RepoController