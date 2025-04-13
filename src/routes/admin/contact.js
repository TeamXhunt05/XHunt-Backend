// Importing express module
const express = require("express")
const router = express.Router()
const contactController = require('../../controllers/contactController')
const authenticateJWT = require('../../middlewares/authenticate')
const cors = require('cors')


router.use(cors());
  // CONTACT API
  router.post("/api/create/contact", contactController.createContact)
  router.post("/api/delete/contact", authenticateJWT, contactController.deleteContact)
  router.post("/api/getAll/contact-list", authenticateJWT, contactController.getAllContactList)






module.exports = router; 