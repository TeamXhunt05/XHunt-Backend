// Importing express module
const express = require("express")
const router = express.Router()
const storeController = require('../controllers/storeController')
const authenticateJWT = require('../middlewares/authenticate')
const cors = require('cors');
const upload = require("../middlewares/image_upload_old");
const { uploadWithFolder } = require("../middlewares/upload_with_folder");


router.use(cors());
//Dashboard Api
router.post('/api/get-all-store',authenticateJWT, storeController.getAllStoreList);
router.post('/api/get-all-store-approve',authenticateJWT, storeController.getAllApproveStoreList);

router.post('/api/add-edit-store',authenticateJWT, uploadWithFolder("stores").single("store_image"), storeController.addEditStore);
router.post('/api/admin/add-edit-store',authenticateJWT, uploadWithFolder("stores").single("store_image"), storeController.addEditStoreAdmin);

router.post('/api/detail-store', storeController.view);
router.post('/api/delete-store', storeController.deleteStore);
router.post('/api/store/status', storeController.storeStatus)
router.post('/api/store-approve/status', storeController.storeStatusApprove)



module.exports = router;