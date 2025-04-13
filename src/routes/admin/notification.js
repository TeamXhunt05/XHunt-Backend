// Importing express module
const express = require("express")
const router = express.Router()
const notificationController = require('../../controllers/notificationController')
const authenticateJWT = require('../../middlewares/authenticate')
const cors = require('cors')


router.use(cors());
  // NOTIFICATION API
  router.post("/api/get/user/notification-list", authenticateJWT, notificationController.getNotificationList)
  router.post("/api/delete/notification", authenticateJWT, notificationController.deleteNotification)
  router.post('/api/get/my/unread-notification' , notificationController.getMyUnreadNotification);
  router.post('/api/user/change-notification-status',authenticateJWT , notificationController.notificationChangeStatus);









module.exports = router; 