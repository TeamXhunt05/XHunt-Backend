// Importing express module
const express = require("express")
const router = express.Router()
const pinController = require('../controllers/pinController')
const authenticateJWT = require('../middlewares/authenticate')
const setupSocket = require('../bin/www')

const cors = require('cors');
const upload = require("../middlewares/image_upload_old");
const { uploadWithFolder } = require("../middlewares/upload_with_folder");


router.use(cors());
//Dashboard Api
router.post('/api/get-all-pin',authenticateJWT, pinController.getAllList);
router.post('/api/detail-pin', pinController.view);
// router.post('/api/detail-pin', pinController.view);





// router.post('/api/add-edit-pin',authenticateJWT, pinController.addEditPin);
// router.post('/api/admin/add-edit-pin',authenticateJWT, pinController.addEditPinAdmin);
// router.post('/api/delete-pin', pinController.deletePin);


// router.post('/api/pin/status', pinController.pinPublished)


//HUNT
// router.post('/api/inventory/pin/', pinController.pinPublished)ls




module.exports = router;