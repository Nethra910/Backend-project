import { Router } from "express"
import healthCare from "../controller/healthcare.controller.js"


const router = Router()
router.get("/",healthCare)
// express internally does it
// router.get("/", (req, res) => {
//    healthCare(req, res)
// })
export default router