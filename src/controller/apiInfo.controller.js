import {ApiResponce} from "../utils/api_responce.js"

const apiInfo = (req,res)=>{
    try 
    {
        res
          .status(200)
          .json( new ApiResponce(200,"Info about api"))
        
    } catch (error) 
    {
        console.log(error)
        
    }
}

export {apiInfo}