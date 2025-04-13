// Importing express module
const express = require("express")
const router = express.Router()
const orderController = require('../controllers/orderController')
const authenticateJWT = require('../middlewares/authenticate')
const cors = require('cors');
const upload = require("../middlewares/image_upload_old");
const { uploadWithFolder } = require("../middlewares/upload_with_folder");


router.use(cors());
//Dashboard Api
router.post('/api/get-all-order',authenticateJWT, orderController.getAllOrderList);
router.post('/api/detail-order', orderController.view);

// router.post('/api/get-all-order-approve',authenticateJWT, orderController.getAllApproveOrderList);

// router.post('/api/add-edit-order',authenticateJWT, uploadWithFolder("Orders").single("Order_image"), orderController.addEditOrder);
// router.post('/api/admin/add-edit-order',authenticateJWT, uploadWithFolder("Orders").single("Order_image"), orderController.addEditOrderAdmin);

// router.post('/api/delete-order', orderController.deleteOrder);
// router.post('/api/Order/status', orderController.OrderStatus)
// router.post('/api/Order-approve/status', orderController.OrderStatusApprove)



module.exports = router;