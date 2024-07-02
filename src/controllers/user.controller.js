import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"


//here asyncHandler is not required -> kyuki hum yaha koi webrequest handle nhi kar rahe hai , yeh humara
//internal method hai 
const generateAccessAndRefreshTokens = async(userId) => {
  
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    //we add refreshToken in user
    user.refreshToken = refreshToken
    //abb user mai save karayege user.save()
    //jab bhi save karenge toh password toh hona hi chahiye , so we have to add a parameter
    //{validateBeforeSave: false} -> means validation mat lagao sidha jaake save karo 
    await user.save({validateBeforeSave: false}) 
    //yeh DB ka operation hai time lagne vala hai so we write await here

    return {accessToken , refreshToken}

  } 

  catch (error) 
  {
     throw new ApiError(500, "Something went wrong while generating access and refresh token")
  }

} 

const registerUser = asyncHandler( async (req,res) => {
  //get user details from frontend
  //validation - not empty
  //check if user already exists: username,email
  //check for images , check for avatar
  //upload them to cloudinary , avatar
  //create user object , create entry in db
  //remove password and refresh token field from response
  //check for user creation
  //return res


  //form se data aa raha hai ya direct json se data aa raha hai toh humko direct req.body mai mil jaayega

  //yeh chije humko req.body se mil jaayegi
 //*****************yaha humne extract kar liye saare data points
  const {fullname , email , username , password} = req.body;
  //console.log("email: " , email)

  //instead of doing this again and again 
//   if(fullname === ""){
//     throw new ApiError(400, "fullname is required")
//   }
//we write


//*************yaha humne check kiya empty string toh nhi h pass ki kisi ne */
//iss case mai humne sabko ek saath check kar liya aur humko value mil gai hai
   if (
    [fullname,email,username,password].some( (field) => 
    //agar field hai toh trim kar dijiye aur agar trim karne k baad bhi empty hai toh automatically true
    //return ho jaayega , inn charo mai se ek bhi field ne true return kara toh matlab voh field khali tha
    field?.trim() === "")
   ) 
   {
          throw new ApiError(400, "All fields are required")
   }


   //**************check if user already exists iss username aur email se
  const existedUser = await User.findOne({
    $or: [{ username } , { email }]
   })

   //**************agar existedUser hai toh vahi k vahi error throw karna hai 
   if (existedUser) {
     throw new ApiError(409, "User with email or username already exists")
   }

   // console.log(req.files)
   //req.body -> yeh default express deta hai 
   //multer hume req.files ka access deta hai 

   // abhi yeh humare server pe hai cloudinary pe nhi gaya hai
   const avatarLocalPath = req.files?.avatar[0]?.path;
   //coverImage ka bhi humne localpath le liya
   //coverImage ki jo first property hai vaha se hume optionally ho sakta hai path mil jaaye

  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
   //coverImage k liye humne condition check hi nhi ki so we have to write below code


  let coverImageLocalPath;
  //Array.isArray(req.files.coverImage -> isse humko pata chalega exactly ki coverImage ka array hai ya
  // nhi hai
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
       coverImageLocalPath = req.files.coverImage[0].path
  }


   //check for avatar ki aaya h ya nhi 
   if(!avatarLocalPath){
    throw new ApiError(400, "Avatar file is required");
   }
  //coverImage ka itna compulsory nhi hai , hai toh bhi chalega nhi hai toh bhi

  //upload them to cloudinary , avatar -> time bhi lagega so we write await here
  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)


  //coverImage agar localpath nhi de raha toh cloudinary humko error nhi de raha sirf empty string return 
  //kar raha hai

  //phir se check karo avatar gaya h ya nhi
    if(!avatar){
        throw new ApiError(400, "Avatar file is required");
    }

    //create entry in db
    //user.create -> method hai object leta hai
   const user = await User.create({
        fullname,
        avatar: avatar.url,
        //yaha hume check karna padega ki coverImage hai ya nhi , kyuki avatar ka toh pehle hi we check
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })


   const createdUser = await User.findById(user._id).select(
    //here we write that kya kya hume nhi chahiye -> we remove password and refreshToken
    "-password -refreshToken"
   )

   //now we check user aaya hai ya nhi aaya hai
   //check for user creation
   if(!createdUser){
    throw new ApiError(500, "Something went wrong while registering the user")
   }


   //return res
   return res.status(201).json(
       new ApiResponse(200,createdUser,"User registered Successfully")
   )

})

const loginUser = asyncHandler( async (req,res) => {
  //get data from the req body
  //check for username or email
  //find the user that it is present or not
  //if user is there then check password
  //if password is correct , generate access and refresh token
  //inn tokens ko hum mostly cookies mai bhejte hai

  //req.body -> se humare pass data aagaya
  const {email,username,password} = req.body;
  
  //if we have neither username nor email then throw an error
   if(!username && !email)
    throw new ApiError(400 , "username or email is required")
  
   //find username or email in the mongoDB database
   //User -> is an object of mongoose
   const user = await User.findOne({
      $or: [{username},{email}]
    })

    if(!user){
      throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
      throw new ApiError(401, "Invalid User Credentials");
    }

    //ho sakta hai time se chije ho na ho -> so we write await here
    const {accessToken , refreshToken} =  await generateAccessAndRefreshTokens(user._id)
//dono tokens ka access aa gaya humare pass

//user ko hume kya kya information bhejni hai
//yaha hum dataBase ko phir se call kar rahe hai
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
//now loggedInUser k pass saare fields hai jo humko bhejne hai except password and refresh token
  

//humari cookies ko bydefault koi bhi modify kar sakta hai frontend pe
const options = {
  httpOnly: true,
  secure: true
  //but after writing these two yeh cookies yeh cookies sirf aur sirf server se modify hoti hai
}

   //abb inn tokens ko cookies mai bhejege
   return res
   .status(200)
   .cookie("accessToken" , accessToken , options)
   .cookie("refreshToken" , refreshToken , options)
   .json(
     new ApiResponse(
      200,
      {
        //agar user apni taraf se accessToken , refreshToken ko access karna chah raha hai
        user: loggedInUser , accessToken , refreshToken
      },
      "User logged In Successfully"
     )
   )

})

const logoutUser = asyncHandler( async (req,res) => {
  //for logout -> refresh token ko bhi refresh karna hoga 
  //aur cookies ko bhi clear karna hoga

  //we create our auth middleware 

   await User.findByIdAndUpdate(
       req.user._id,
       {
        //this set is mongodb operator
        $set: {
         //refresh token database se remove kar diye
          refreshToken: undefined
        }
      },
      {
        //jo return mai humko response milega usme new updated value milegi
        new: true
      }
    )

    const options = {
      httpOnly: true,
      secure: true
    }

     return res
     .status(200)
     .clearCookie("accessToken" , options)
     .clearCookie("refreshToken" , options)
     .json(new ApiResponse(200 , {} , "User Logged Out"))
})

const refreshAccessToken = asyncHandler (async (req,res) => {

    //koi uss end point ho hit kar raha hai toh we can access through cookies
    //ho sakta hai mobile app use kar raha ho -> req.body.refreshToken
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
  
  //if refresh token is not there we throw an error
  if(!incomingRefreshToken){
    throw new ApiError(401,"Unauthorized request");
  }

 try {

   //jo incoming token aa raha hai usko verify bhi karna padega
   //we get a decoded token
    const decodedToken = jwt.verify(
     incomingRefreshToken,
     process.env.REFRESH_TOKEN_SECRET
    )
 
      //abb mongoDb se query maangke user ki information lenge 
      //decoded token se user nikaal diya humne
      const user = await User.findById(decodedToken?._id)
 
      //abb agar user nhi hai toh we throw an api error
     if(!user){
       throw new ApiError(401,"Invalid Refresh Token");
     }
 
     if(incomingRefreshToken !== user?.refreshToken){
       throw new ApiError(401,"Refresh Token is expired or Used");
     }
     //means humara refreshToken expired ho gaya hai ya invalid hai
 
     //now both tokens matched
     //we generate new tokens
     const options = {
       httpOnly: true,
       secure: true
     }
 
     const {accessToken,newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
 
     return res
     .status(200)
     .cookie("accessToken",accessToken,options)
     .cookie("refreshToken",newRefreshToken,options)
     .json(
       new ApiResponse(
         200,
         {accessToken, refreshToken : newRefreshToken},
         "Access Token Refreshed"
       )
     )
 }
 
 catch (error) {
    throw new ApiError(401 , error?.message || "Invalid Refresh Token")
 }

})

const changeCurrentPassword = asyncHandler (async (req,res) => {

  const {oldPassword,newPassword} = req.body

  const user = await User.findById(req.user?._id)
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

  if(!isPasswordCorrect){
    throw new ApiError(400, "Invalid old password");  
  }

    //now we set new password here
    user.password = newPassword

    await user.save({validateBeforeSave: false})

     return res
    .status(200)
    .json(new ApiResponse(200, {} , "Password Changed Successfully"))

})

const getCurrentUser = asyncHandler (async (req,res) => {
  return res
  .status(200)
  .json(new ApiResponse(200, req.user, "current user fetched successfully"))
})

const updateAccountDetails = asyncHandler (async (req,res) => {
  
  const {fullname , email} = req.body

  if(!fullname || !email){
    throw new ApiError(400, "All fields are required")
  }

  const user = User.findByIdAndUpdate(
    req.user?._id,
    {
      //here we write mongodb operator
      $set: {
         fullname,
         email: email
      }
    },
    {new: true} //means update hone k baad jo information hai voh return hoti hai yaha pe

  ).select("-password")  

    return res
    .status(200)
    .json(new ApiResponse(200 , user , "Account details updated successfully"))

})

//while doing routing we take care of two things (two middlewares)
//we are using two middlewares first is multer -> so that we can accept the files
//2nd vahi log update kar paayege jo loggedin ho
const updateUserAvatar = asyncHandler (async (req,res) => {
   const avatarLocalPath = req.file?.path

   if(!avatarLocalPath){
    throw new ApiError(400 , "Avatar file is missing")
   }

   const avatar = await uploadOnCloudinary(avatarLocalPath)

   //avatar jo upload kara hai usme agar url nhi hai 
   if(!avatar.url){
    throw new ApiError(400 , "Error while uploading on avatar")
   }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      //yaha jo update karna hai voh
      $set: {
        avatar: avatar.url
      }
    },
    {new: true}
   ).select("-password")

   return res
   .status(200)
   .json(
    new ApiResponse(200, user , "Avatar Image updated Successfully")
   )


})


const updateUserCoverImage = asyncHandler (async (req,res) => {
  const coverImageLocalPath = req.file?.path

  if(!coverImageLocalPath){
   throw new ApiError(400 , "Cover Image file is missing")
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  //avatar jo upload kara hai usme agar url nhi hai 
  if(!coverImage.url){
   throw new ApiError(400 , "Error while uploading on cover Image")
  }

  const user = await User.findByIdAndUpdate(
   req.user?._id,
   {
     //yaha jo update karna hai voh
     $set: {
       coverImage: coverImage.url
     }
   },
   {new: true}
  ).select("-password")

  return res
  .status(200)
  .json(
   new ApiResponse(200, user , "Cover Image updated Successfully")
  )
  
})


export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage
}

