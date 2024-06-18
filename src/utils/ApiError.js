class ApiError extends Error{
    //jo bhi iss constructor ko use karega that will give us status code
    constructor(
       statusCode,
       message= "Something went Wrong",
       errors = [],
       stack = ""
    ){
        //yaha humne chijo ko overwrite kiya
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors

        if(stack){
            this.stack = stack
        }
        else{
            Error.captureStackTrace(this,this.constructor)
        }
    }


}

export {ApiError}