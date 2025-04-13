// Importing express module
const express = require("express")
const router = express.Router()
const pageController = require('../../controllers/pageController')
const authenticateJWT = require('../../middlewares/authenticate')
const cors = require('cors')


router.use(cors());
  // Statcic Page Managment API
  router.post('/api/create-pages', authenticateJWT, pageController.createPages);
  router.put('/api/update-pages', authenticateJWT, pageController.updatePages);
  router.get('/api/get-pages', pageController.getPages);
  router.post('/api/getAll-pages', pageController.getAllPages);
  router.delete('/api/delete-pages', authenticateJWT, pageController.deletePages);
  router.post('/api/get-pages/slug', pageController.getPageSlug);
  router.put('/api/status-update-pages', authenticateJWT, pageController.statusUpdate);

  // Statcic Page
  router.get('/api/terms',  pageController.terms);
  router.get('/api/privacy', pageController.privacy);
  router.get('/api/about', pageController.about);

  router.get('/api/contact', pageController.contact);






module.exports = router;