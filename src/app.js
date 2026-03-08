import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

import healthCareRoute from "./routes/healthcare.routes.js"
import ApiInfo from "./routes/apiInfo.routes.js"
import authRoute from "./routes/auth.route.js"

const app = express()
app.use(cookieParser())

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true}))
app.use(express.static("public"))

app.use(cors({
  origin:"http://localhost:5173",
  credentials:true
}))

app.use("/api/v1/healthcheck",healthCareRoute)
app.use("/api/v1/info",ApiInfo)
app.use("/api/v1/auth",authRoute)

app.get("/",(req,res)=>{
  res.send("Hello world")
})

export default app