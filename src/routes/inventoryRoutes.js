// Importing express module
const express = require("express")
const router = express.Router()
const inventoryController = require('../controllers/inventoryController')
const authenticateJWT = require('../middlewares/authenticate')
const cors = require('cors')


router.use(cors());
  // PIN API


  router.get("/api/inventory/get-pin/:id",authenticateJWT, inventoryController.pinDetail)
  router.get( "/api/inventory/pin/",authenticateJWT, inventoryController.getAllPins)
  router.post( "/api/inventory/near-by-pin/", inventoryController.getAllNearByPins)
  router.post("/api/inventory/product/", inventoryController.getAllPinProduct)
  router.post("/api/inventory/store/detail/", inventoryController.storeDetail)

  router.post("/api/inventory/wallet/",authenticateJWT, inventoryController.inventoryWallet)
  router.put("/api/inventory/wallet/",authenticateJWT, inventoryController.inventoryUpdate)

  router.get("/api/inventory/wallet/:_id",authenticateJWT, inventoryController.inventoryWalletDetail)






  // router.post("/api/inventory/tag/", inventoryController.createTimeTable)
  // router.post("/api/inventory/category/", inventoryController.createTimeTable)
  // router.post("/api/inventory/wallet/", inventoryController.createTimeTable)
  












module.exports = router; 