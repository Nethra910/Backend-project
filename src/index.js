import dotenv from "dotenv"
import app from "./app.js"
import connectDB from "./db/indexDB.js"

dotenv.config()


const port = process.env.PORT || 3000



connectDB()
  .then(()=>{
    app.listen(port, () => {
    console.log(`app listening on port https://localhost:${port}`)
    })
  })
  .catch((err)=>{
    console.error("Error in MongoDB connection : ",err)
    process.exit(1)
  })



