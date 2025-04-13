// Importing express module
const express = require("express")
const router = express.Router()
const authCtrl = require('../../controllers/authController')
const authenticateJWT = require('../../middlewares/authenticate')
const cors = require('cors')
const upload = require("../../middlewares/image_upload");



router.use(cors());
//API RUNNING
router.get('/api', authCtrl.apis)
router.get('/', authCtrl.apis)



// ***USERS API****
//All Users API checking prefix
router.post('/api/send-otp', authCtrl.sendOtp)
router.post('/api/signup', upload.any(), authCtrl.signup)

router.post('/api/user/login', authCtrl.loginUser)
router.post('/api/user/resetPassword', authCtrl.recoverPasswordUser)
router.post('/api/user/changePassword',authenticateJWT, authCtrl.changepassword)


 


router.post('/api/resetPassword/mobile', authCtrl.forgotpasswordmobile);
router.get('/api/resetPasswordView/mobile', authCtrl.recoverpasswordmobileview);
router.post('/api/recoverPassword/mobile', authCtrl.recoverpasswordfrommobile);
router.post('/api/user/get-profile',authenticateJWT, authCtrl.getUserProfile);
router.post('/api/student/get-profile',authenticateJWT, authCtrl.getStudentProfile);
router.post('/api/user/update-profile', upload.any(), authCtrl.updateProfile);



router.post('/api/forgetpassword', authCtrl.forgotpassword);

//GET ALL SCOOLS LISTSS
router.get('/api/get-all-school/list', authCtrl.getAllSchools)

//EMPLOYEE API
router.post('/api/employee/swipe-meal',authenticateJWT, authCtrl.swipeMeal)
router.post('/api/user/meal-list',authenticateJWT, authCtrl.userMealList)
router.post('/api/get/security-officer-number', authCtrl.getSecurityNumber)


//ACCOUNT DEACTIVATED
router.post('/api/user/account-deactivated', authCtrl.accountDeactivated)


 //Image Upload
router.post('/api/image-upload', upload.any(), authCtrl.imageUpload)





//HUNT ROUTES
router.post('/api/user/account-deactivated', authCtrl.accountDeactivated)


 
  

module.exports = router;  