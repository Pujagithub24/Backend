//yeh middleware sirf verify karega ki user hai ya nhi hai 
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";


export const verifyJWT = asyncHandler( async (req, _ ,
//next -> humara kaam hogaya phir usko chahe -> agle middleware pe leke jaao , response pe leke jaao
    next
) => {

    try {
      //app.use(cookieParser()) -> means req k pass cookies ka access bhi hai 
      //ho sakta hai ki user custom header bhej raha ho  
      //inn dono mai se humne token nikal diye
     const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
       
     if(!token){
      throw new ApiError(401, "Unauthorized Request")
     }
  
     const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)
  
     const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
  
     if(!user){
      throw new ApiError(401, "Invalid Access Token")
     }
  
    //here we add new object in request
    req.user = user;
    next() //middleware ka kaam ho gaya hai (verifyJWT) abb next logoutUser middleware pe jaao
     
  }

   catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token")
  }

})