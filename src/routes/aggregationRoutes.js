// Importing express module
const express = require("express")
const router = express.Router()
const aggregationController = require('../controllers/aggregationController')
cons = require('../middlewares/authenticate')
const cors = require('cors')


router.use(cors());
  // TIME TABLE API
  router.post("/api/aggregation/logs/", aggregationController.createTimeTable)
  router.post( "/api/aggregation/upload/", aggregationController.createTimeTable)
  router.post("/api/aggregation/upload-stores/", aggregationController.createTimeTable)
  router.post( "/api/aggregation/rating/", aggregationController.createTimeTable)
  router.post("/api/aggregation/favourite/", aggregationController.createTimeTable)
  router.post("/api/aggregation/favourite-product/", aggregationController.createTimeTable)
  router.post(  "/api/aggregation/uploadexcel-stores/", aggregationController.createTimeTable)
  












module.exports = router; 