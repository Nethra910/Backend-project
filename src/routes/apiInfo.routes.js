import {apiInfo} from "../controller/apiInfo.controller.js"
import {Router} from "express"
const route = Router()
route.get("/about",apiInfo)
export default route