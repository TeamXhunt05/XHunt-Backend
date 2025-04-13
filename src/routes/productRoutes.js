// Importing express module
const express = require("express")
const router = express.Router()
const productController = require('../controllers/productController')
const authenticateJWT = require('../middlewares/authenticate')
const cors = require('cors');
const upload = require("../middlewares/image_upload_old");
const { uploadWithFolder } = require("../middlewares/upload_with_folder");


router.use(cors());
//Dashboard Api
router.post('/api/get-all-product', authenticateJWT,productController.getAllProductList);
router.post('/api/add-edit-product',authenticateJWT, uploadWithFolder("products").single("product_image"), productController.addEditProduct);
router.post('/api/admin/add-edit-product',authenticateJWT, uploadWithFolder("products").single("product_image"), productController.addEditAdminProduct);

// router.post('/api/detail-product', productController.getAllProductList);
router.post('/api/delete-product', productController.deleteProduct);
router.post('/api/product/status', productController.prductPublished)


module.exports = router;