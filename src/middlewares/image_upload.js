const multer = require("multer");
const Path = require('path');
const fs = require('fs');
const appRoot = require('app-root-path');

exports.uploadWithFolder = (folderName) => {
  return imageUpload = multer({
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        const DIR = Path.join(appRoot + "/public/" + folderName);

        if (!fs.existsSync(DIR)) {
          fs.mkdirSync(DIR);
        }
        cb(null, DIR)
      },
      filename: function (req, file, cb) {

        const str = file.originalname;

        const extension = str.substr(str.lastIndexOf("."));
        const fileName = Date.now() + '' + Math.round(Math.round(Math.random() * 5000)) + '' + extension;
        cb(null, fileName)
      }
    })
  })
}









const storage = multer.diskStorage({
  destination: function (req, file, cb) {

    const DIR = Path.join(appRoot + "/public/");
    // const DIR = Path.join(__dirname, '../../public/');

    if (!fs.existsSync(DIR)) {
      fs.mkdirSync(DIR);
    }
    cb(null, DIR)
  },
  filename: function (req, file, cb) {
    const str = file.originalname;

    const extension = str.substr(str.lastIndexOf("."));
    const fileName = Date.now() + '' + Math.round(Math.round(Math.random() * 5000)) + '' + extension;
    cb(null, fileName)
  }
});

const upload = multer({ storage: storage })



module.exports = upload