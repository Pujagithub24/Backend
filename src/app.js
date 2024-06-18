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

export { app }