 // Importing express module
const express = require("express")
const rootRouter = express.Router()

//****HUNT START ROUTES****
const authenticationRoutes = require('./authenticationRoutes');
const inventoryRoutes = require('./inventoryRoutes');
const paymentRoutes = require('./paymentRoutes');
const aggregationRoutes = require('./aggregationRoutes');


const storeRoutes = require('./storeRoutes');
const pinRoutes = require('./pinRoutes');
const productRoutes = require('./productRoutes');
const orderRoutes = require('./orderRoutes');



//****HUNT END ROUTES****





//****START ROUTES****
// USER
const user_auth = require('./user/auth');
// ****ADMIN****
const admin_auth = require('./admin/auth');
const dashboard = require('./admin/admin')
const user_managment = require('./admin/user')
const setting = require('./admin/setting')
const page = require('./admin/page')
const notification = require('./admin/notification')
//****END ROUTES****


 





//****Combine Routes****
// USER
rootRouter.use('/', user_auth);

// ADMIN
rootRouter.use('/', admin_auth);
rootRouter.use('/', dashboard);
rootRouter.use('/', user_managment);
rootRouter.use('/', setting);
rootRouter.use('/', page);
rootRouter.use('/', notification);



//HUNT ROUTES
rootRouter.use('/', authenticationRoutes);
rootRouter.use('/', inventoryRoutes);
rootRouter.use('/', paymentRoutes);
rootRouter.use('/', aggregationRoutes);
rootRouter.use('/', storeRoutes);
rootRouter.use('/', pinRoutes);
rootRouter.use('/', productRoutes);
rootRouter.use('/', orderRoutes);







//Export Routes
module.exports = rootRouter;