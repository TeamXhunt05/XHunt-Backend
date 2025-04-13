// Importing express module
const express = require("express")
const router = express.Router()
const paymentController = require('../controllers/paymentController')
const authenticateJWT = require('../middlewares/authenticate')
const cors = require('cors')


router.use(cors());
// CART
router.post('/api/add/product/cart',authenticateJWT, paymentController.addToCart);
router.post('/api/remove/product/cart', paymentController.removeToCart);
router.post('/api/update/qty/cart', paymentController.updateQty);
router.get('/api/my/cart',authenticateJWT, paymentController.myCart);

// ORDER BILL
router.post("/api/payment/StoreBillingPayment/",authenticateJWT, paymentController.StoreBillingPayment)
router.post("/api/payment/handlepayment/",authenticateJWT, paymentController.HandlePayment)
router.post(  "/api/payment/updatehandlepayment/",authenticateJWT, paymentController.UpdateHandlePayment)
router.get("/api/payment/StoreBillingPayment/",authenticateJWT, paymentController.StoreBillingPaymentList)
router.post("/api/payment/StoreBillingPayment/view/",authenticateJWT, paymentController.StoreBillingPaymentListView)

router.post( "/api/payment/generate-token/",authenticateJWT, paymentController.GenereateToken)
router.post("/api/payment/CheckOrder/",authenticateJWT, paymentController.CheckOrder)
  
router.post( "/api/payment/order/",authenticateJWT, paymentController.OrderApi)
router.post("/api/payment/pickup-otp/", authenticateJWT,paymentController.PickupOtpApi)
router.post("/api/payment/pickup-otp/verify/", authenticateJWT,paymentController.VerifyPickupOtpApi)










  router.post( "/api/payment/payment/", paymentController.OrderApi)
  router.post("/api/payment/refund/", paymentController.RefundApi)

  router.post( "/api/payment/test/generate-token/", paymentController.TestGenereateToken)


  










module.exports = router; 