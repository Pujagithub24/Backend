//jo bhi file humari server pe jaa chuki hai , server se aap humko local path doge aur phir hum us file ko
//cloudinary pe daal dunga
//uske baad server se bhi file ko remove karna padega

import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'

//yeh configuration hi file upload karne ki permission dega 
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});


const uploadOnCloudinary = async (localFilePath) => {
  try {
    if(!localFilePath)
        return null

    //upload the file on cloudinary
   const response = await cloudinary.uploader.upload(localFilePath,{
        resource_type: "auto"
    })
    //file has been uploaded successfully
    //upload hone k baad jo yaha public url hai voh humko mil jaayega
    console.log("File is uploaded on Cloudinary " , response.url);

    return response;
  } 
  catch (error) {
    //now hum file ko server se hata denge
     fs.unlinkSync(localFilePath) //remove the locally saved temporary file as the 
     //upload operation got failed
     return null
  }
}

export {uploadOnCloudinary}

