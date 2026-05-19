import express from "express"
import CardController from "../controllers/card.controller.js"

const router = express.Router()

router.get("/public/:userId", CardController.test)

export default router