// Importing express module
const express = require("express")
const router = express.Router()
const authCtrl = require('../../controllers/authController')
const authenticateJWT = require('../../middlewares/authenticate')
const cors = require('cors')
const upload = require("../../middlewares/image_upload");

router.use(cors());
// ***ADMIN APIS****
router.post('/api/admin/login', authCtrl.adminLogin)
router.post('/api/admin/resetPassword', authCtrl.adminrecoverpassword);
router.post('/api/admin/forgetpassword', authCtrl.adminforgotpassword);
router.post('/api/verify/otp', authCtrl.adminverifyOtp);
router.post('/api/send-otp-to-user', authCtrl.sendOtpVerify)


// SUBADMIN SIGNUP
router.post('/api/store/signup', upload.any(), authCtrl.subadminSignup)
router.post('/api/stripe-pay', authCtrl.stripeAmountPay)
router.post('/api/stripe-pay-callback', authCtrl.stripeAmountPayCallback)
router.post('/api/stripe-payment-list', authCtrl.stripePaymentList)




module.exports = router;