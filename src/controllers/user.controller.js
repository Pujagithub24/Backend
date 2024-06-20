import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


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
  const {fullname , email , username , password} = req.body;
  console.log("email: " , email)

  //instead of doing this again and again 
//   if(fullname === ""){
//     throw new ApiError(400, "fullname is required")
//   }
//we write


//iss case mai humne sabko ek saath check kar liya aur humko value mil gai hai
   if (
    [fullname,email,username,password].some( (field) => 
    //agar field hai toh trim kar dijiye aur agar trim karne k baad bhi empty hai toh automatically true
    //return ho jaayega , inn charo mai se ek bhi field ne true return kara toh matlab voh field khali tha
    field?.trim() === "")
   ) {
          throw new ApiError(400, "All fields are required")
   }


   //check if user already exists: username,email
  const existedUser = User.findOne({
    $or: [{ username } , { email }]
   })

   //agar existedUser hai toh vahi k vahi error throw karna hai 
   if (existedUser) {
     throw new ApiError(409, "User with email or username already exists")
   }


   //req.body -> yeh default express deta hai 
   //multer hume req.files ka access deta hai 

   // abhi yeh humare server pe hai cloudinary pe nhi gaya hai
   const avatarLocalPath = req.files?.avatar[0]?.path;
   //coverImage ka bhi humne localpath le liya
   //coverImage ki jo first property hai vaha se hume optionally ho sakta hai path mil jaaye
   const coverImageLocalPath = req.files?.coverImage[0]?.path;

   //check for avatar ki aaya h ya nhi 
   if(!avatarLocalPath){
    throw new ApiError(400, "Avatar file is required");
   }
  //coverImage ka itna compulsory nhi hai , hai toh bhi chalega nhi hai toh bhi

  //upload them to cloudinary , avatar -> time bhi lagega so we write await here
  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)


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
    //here we write that kya kya hume nhi chahiye
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

export {registerUser}

