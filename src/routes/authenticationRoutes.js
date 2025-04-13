// Importing express module
const express = require("express")
const router = express.Router()
const authenticationController = require('../controllers/authenticationController')
const authenticateJWT = require('../middlewares/authenticate')
const cors = require('cors')
const { uploadWithFolder } = require("../middlewares/upload_with_folder");



router.use(cors());
  // AUTHENTICATION APIS
  router.post("/api/auth/phone-login/", authenticationController.phoneLogin)
  router.post("/api/auth/change-password/",authenticateJWT, authenticationController.changePassword)
  router.post("/api/auth/forgot-password/", authenticationController.forgotpasswordmobile)
  router.get("/api/auth/user-profile/",authenticateJWT, authenticationController.getUserProfile)
  router.put('/api/auth/user-profile/update',authenticateJWT, uploadWithFolder("users").single("avatar"), authenticationController.updateUserProfile);



  //STORE REVIEWS APIS
  router.post( "/api/auth/store-reviews/",authenticateJWT, authenticationController.storeReview)








  // router.post("/api/auth/register/", authenticationController.createTimeTable)
  // router.post("/api/auth/login/", authenticationController.createTimeTable)
  // router.post("/api/auth/social-login/", authenticationController.createTimeTable)
  // router.post( "/api/auth/verify-otp/", authenticationController.createTimeTable)
  // router.post("/api/auth/organization/", authenticationController.createTimeTable)
  // router.post( "/api/auth/store/", authenticationController.createTimeTable)
  // router.post("/api/auth/user-location/", authenticationController.createTimeTable)
  // router.post( "/api/auth/verify-account/<uid>/<token>", authenticationController.createTimeTable)
  // router.post("/api/auth/verify-store/", authenticationController.createTimeTable)
  // router.post("/api/auth/verify-pin/", authenticationController.createTimeTable)
  // router.post( "/api/auth/verify-product/", authenticationController.createTimeTable)
  // router.post( "/api/auth/store-reviews/", authenticationController.createTimeTable)















module.exports = router; 