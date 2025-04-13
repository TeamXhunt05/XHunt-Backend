// Importing express module
const express = require("express")
const router = express.Router()
const settingController = require('../../controllers/settingController')
const authenticateJWT = require('../../middlewares/authenticate')
const cors = require('cors')


router.use(cors());
  // Side Setting API
  router.post('/api/list/setting', settingController.list);
  router.post('/api/create/setting', settingController.create);
  router.post('/api/edit/:id/setting', settingController.edit);
  router.post('/api/update/:id/setting', settingController.update);
//   router.post('/delete/:id/setting', settingController.delete);



module.exports = router;