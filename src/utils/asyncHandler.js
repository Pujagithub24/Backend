//TQ-2
const asyncHandler = (requestHandler) => {
   return (req,res,next) => {
      Promise.resolve(requestHandler(req,res,next)).catch((err) => next(err))
    }
}


export {asyncHandler}



//inn some codebases we see the other way also
/*
//const asyncHandler = () => {() => {}}
    //ek function liya aur usko ek aur function mai pass kar diya aur usko async kar diya
    //we can also take err here
const asyncHandler = (fn) = async (req,res,next) => {

//har ek function jo hum le rahe hai uske aage try catch ka wrapper laga rahe hai 
try {
    await fn(req,res,next)
} 

catch (error) {
    //response k baad hum ek status bhej dete hai , agar user pass kar raha hai error code toh hum sidha 
    //err.code bhej dete hai aur nhi pass kara toh 500 bhej dete hai , phir json response bhi bhejte hai 
    res.status(err.code || 500).json({
     success: false,
     message: err.message
    })
}
}

*/





