// Importing express module
const express = require("express")
const router = express.Router()
const adminController = require('../../controllers/adminController')
const authenticateJWT = require('../../middlewares/authenticate')
const cors = require('cors')


router.use(cors());
//Dashboard Api
router.post('/api/dashboard', authenticateJWT, adminController.dashBoard);





module.exports = router;