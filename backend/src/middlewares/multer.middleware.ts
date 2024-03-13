import multer from "multer";
import {v4 as uuid} from "uuid"


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      // theres something to change 
      const id = uuid();
      const ext = file.originalname.split('.').pop();
      cb(null,`${id}.${ext}`);
    }
})
  
export const upload = multer({ 
    storage 
})