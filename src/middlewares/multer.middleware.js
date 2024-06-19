import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        //saari files humne public folder mai rakhi taaki uska easily access mil jaaye
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
    //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    //   cb(null, file.fieldname + '-' + uniqueSuffix)
      cb(null, file.originalname)
    }
  })
  
  export const upload = multer({
    //  storage: storage
    //or in Es6 these both are same
    storage,
    })

