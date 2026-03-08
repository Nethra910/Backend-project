import {ApiResponce} from "../utils/api_responce.js"

const healthCare = (req,res)=>{
    try 
    {
        res.status(200).json( new ApiResponce(200,"server is running"))
        
    } catch (error) 
    {
      console.error(error)  
    }
    
}

export default healthCare