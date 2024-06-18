// require('dotenv').config({path: './env'})  -> more improved versions of this 
import dotenv from 'dotenv'

import connectDB from "./db/index.js";


dotenv.config({
    path: './env'
})

//TQ-2
connectDB()





/*  TQ-1
import express from 'express'
const app = express()

//iifi -> function ko immediately execute kardo
//before the start of iife we write semicolon (to make it clean) -> agar purani line mai semicolon nhi hai
//toh problem ho sakti hai
// ;( async () => {})()

( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`) //our DB is connect

        app.on("error", (error) => {
            console.log("Our application not be able to talk to database",error);
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`)
        })
    } 

    catch (error) {
       console.log("ERROR: ", error) ;
       throw error
    }
})()

*/