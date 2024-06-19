import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'


const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))

//these all four are configurations
//for cookie parser
//express json file le raha hai
app.use(express.json({Limit: "16kb"}))

app.use(express.urlencoded({extended: true , limit: "16kb"}))

//express ki ek aur configuration -> static
//kai bar hum kuch file folder store karna chahte hai , let pdf we want to store , let images we want to 
//store in our server
//so we make a public folder so that anyone can access
app.use(express.static("public"))

//cookie-parser work is mai mere server se user ka jo browser hai na uske andar ki cookies access kar pao
//aur uski cookies set bhi kar paao
app.use(cookieParser())

//routes import 
import userRouter from './routes/user.routes.js'

//routes declaration
//app.get -> pehle hum app through yhi routes likh rahe the yhi controllers likh rahe the 
//but in this case humne router ko separate nikal k rakh diya 
//so abb router ko laane k liye middleware laana padega

//"/users" pe humko userrouter activate karvana hai (koi bhi user ne likha /users -> control chala gaya 
//userRouter k pass)
// app.use("/users",userRouter)
app.use("/api/v1/users",userRouter)  //-> we are making version 1 of api

//http://localhost:8000/api/v1/users/register
//we get -> http://localhost:8000/users/register
export { app }