const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function(req,res,cb){
    cb(null,"uploads/");
  },

  filename: function(req,file,cb){
    const uniqueName =
      Date.now() +
      path.extname(file.originalname);

    cb(null,uniqueName);
  }
});

const fileFilter = (req,file,cb) => {

  const allowed =
    [
      "application/pdf",

      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

  if(allowed.includes(file.mimetype)){
    cb(null,true);
  }else{
    cb(new Error("Only PDF/DOCX Allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter
});

module.exports = upload;