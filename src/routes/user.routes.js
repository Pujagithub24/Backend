import { Router } from "express";
import { registerUser , loginUser, logoutUser, refreshAccessToken } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    //multer(middleware) for file upload
    upload.fields([
       //upload for avatar
        {
            name: "avatar",
            //hum ek hi file accept karenge isliye 1
            maxCount: 1
       },
       {
            name: "coverImage",
            maxCount: 1
       } 
    ]),
    registerUser
)

router.route("/login").post(loginUser)

//secured routes
//verigyJWT -> middleware ko inject karva diya
router.route("/logout").post(verifyJWT, logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

export default router