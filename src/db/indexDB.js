import mongoose from "mongoose"

const connectDB = async ()=>{
    try 
    {
       await mongoose.connect(process.env.MONGODB_URI)
       console.log("✅ Mongo Conntected")
        
    } catch (error)
    {
        console.error("Mongo connection failed: ",error)
        process.exit(1)
        
    }
}

export default connectDB