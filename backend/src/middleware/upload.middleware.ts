import multer from "multer";

const storage = multer.memoryStorage();

const allowedMimeTypes = [

  "application/pdf",

  "image/jpeg",

  "image/png",

  "image/jpg"

];

const fileFilter = (

  req: any,

  file: Express.Multer.File,

  cb: multer.FileFilterCallback

) => {

  if (allowedMimeTypes.includes(file.mimetype)) {

    cb(null, true);

  } else {

    cb(

      new Error(

        "Only PDF, JPG, JPEG and PNG files are allowed."

      )

    );

  }

};

const upload = multer({

  storage,

  limits: {

    fileSize: 10 * 1024 * 1024

  },

  fileFilter

});

export default upload;