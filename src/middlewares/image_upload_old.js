// ****Multer S3 Bucket****

const multer = require("multer");
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
//USE FOR ENV
require('dotenv').config()




const S3_BUCKET ={
    AWS_BUCKET_NAME : process.env.AWS_BUCKET_NAME,
    AWS_BUCKET_REGION : process.env.AWS_BUCKET_REGION,
    AWS_ACCESS_KEY_ID : process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY : process.env.AWS_SECRET_ACCESS_KEY,
  
  }

aws.config.update({
    secretAccessKey: S3_BUCKET.AWS_SECRET_ACCESS_KEY,
    accessKeyId: S3_BUCKET.AWS_ACCESS_KEY_ID,
    region: S3_BUCKET.AWS_BUCKET_REGION
});

const s3 = new aws.S3();
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: S3_BUCKET.AWS_BUCKET_NAME,
        key: function (req, file, cb) {



            const str = file.originalname;
            const extension = str.substr(str.lastIndexOf("."));
            const fileName = Date.now() + '' + Math.round(Math.round(Math.random() * 5000)) + '' + extension;
            cb(null, 'public_asset/' + fileName);
        

        }
        
    }
    )
    
});

module.exports = upload





// ************Multer Only**************
// const multer = require("multer");
// const Path = require('path');
// const fs = require('fs');




// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
  
//       const DIR = Path.join(__dirname, './public/');
//       if (!fs.existsSync(DIR)) {
//         fs.mkdirSync(DIR);
//       }
//       cb(null, DIR)
//     },
//     filename: function (req, file, cb) {
//       const str = file.originalname;
     
//       const extension = str.substr(str.lastIndexOf("."));
//       const fileName = Date.now() + '' + Math.round(Math.round(Math.random() * 5000)) + '' + extension;
//       cb(null, fileName)
//     }
//   });
  
//   const upload = multer({ storage: storage })


// module.exports = upload
