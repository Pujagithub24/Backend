import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

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


export default router