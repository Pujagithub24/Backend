import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {

     try {
        //connection hone k baad jo bhi response hai usko hum hold kar sakte hai
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n  MongoDB Connected !!!  DB Host : ${connectionInstance.connection.host}`)
     }
      catch (error) {
        console.log("MongoDB connection FAILED: ",error);
        process.exit(1); //feature of nodejs
     }
}

export default connectDB