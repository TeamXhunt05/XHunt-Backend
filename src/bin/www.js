// #!/usr/bin/env node

// /**
//  * Module dependencies.
//  */




// var app = require('../app');
// var debug = require('debug')('backend:server');
// var https = require('https');
// var http = require('http');
// var fs = require('fs');



// // const socketioServer = require('../SocketIO/PinSocketIo');

// var https_options = {
//   // key: fs.readFileSync("/Users/kalyansingh/Desktop/Project/vivaquad/admin-backend/backend-vivaquad/certificate/vivaquad.key"),
//   // cert: fs.readFileSync("/Users/kalyansingh/Desktop/Project/vivaquad/admin-backend/backend-vivaquad/certificate/vivaquad.crt")

// };

// // var https_options = {
// //   key: fs.readFileSync("/home/ubuntu/ssl-certs/vivaquad.key"),
// //   cert: fs.readFileSync("/home/ubuntu/ssl-certs/vivaquad.crt")

// //  };
// /**hro
//  * Get port from environment and store in Express.
//  */

// var port = normalizePort(process.env.PORT || '5000');
// app.set('port', port);
// /**
//  * Create HTTP server.
//  */









// // var server = https.createServer(https_options, app);
// var server = http.createServer(app);







// //SOCKET CODE START
// var { Pin  , Store , UserLogins}= require('../db/conn');

// const pinController = require('../controllers/pinController')
// const authenticateJWT = require('../middlewares/authenticate')
// const socketio = require('socket.io');
// const io = socketio(server,{
//   cors: {
//     origin: "*",
//     // http://3.7.231.97
//     methods: ["GET", "POST"],

//   }
// });



// // Middleware function to set up Socket.io connection
// const setupSocket = (req, res, next) => {
//   const socket = io
//   req.socket = socket;
//   next();
// };





// //FOR SOCKET
// app.post('/api/add-edit-pin',authenticateJWT,setupSocket,   async (req, res, next) => {




//   try {
  
//     const {  title, description, type,offer_type ,discount_unit ,min_transaction_value ,discount_amount ,max_discount_value ,categories  , _id} = req.body;
//     const socket = io;
  
  
  
  
  
//     let getStore = await Store.findOne({user_id : req.user._id});
  
//     if(!getStore){
//     return res.send({ status: false, message: "Store Not Found" });
  
//     }
//     let pinData
  
//     if(categories === 'LAST_MINUTE_PIN'){
//       pinData = {
//         title: title,
//         description :description,
//         discount_unit:discount_unit,
//         min_transaction_value:min_transaction_value,
//         discount_amount:discount_amount,
//         max_discount_value:max_discount_value,
//         categories:categories,
//         location: {
//           "type": "Point",
//           "coordinates": [
//             getStore.longitude , getStore.latitude
//           ]
//         },
//       latitude: getStore.latitude,
//       longitude: getStore.longitude,
//       store_id : getStore._id
  
        
        
  
//     }
  
//     }else   if(categories === 'FLAT_DISCOUNT_PIN'){
//       pinData = {
//         title: title,
//         description :description,
//         categories:categories,
//         location: {
//           "type": "Point",
//           "coordinates": [
//             getStore.longitude , getStore.latitude
//           ]
//         },
//       latitude: getStore.latitude,
//       longitude: getStore.longitude,
//       store_id : getStore._id
  
        
        
  
//     }
//     }
  
  
  
   
  
  
//     if(_id){
  
  
//   delete pinData.categories
  
//       let updated = await Pin.updateOne({ _id: _id }, pinData).lean().exec();
//                           const getAllPin = await Pin.find({is_published : true})
  
//       socket.emit('show_pins', { status: true, getAllPin: getAllPin })
  
//     return res.send({ status: true, message: 'updated successfully' });
  
  
//     }else{
   
  
  
//     const resultData = new Pin(pinData);
//     await resultData.save();
  
//                         const getAllPin = await Pin.find({is_published : true})
  
//     socket.emit('show_pins', { status: true, getAllPin: getAllPin })
  
//     return res.send({ status: true, message: 'created successfully' });
//     }
  
  
  
  
//   } catch (error) {
//     return res.send({ status: false, message: error.message });
//   }
//     });

// app.post('/api/admin/add-edit-pin',authenticateJWT, setupSocket,   async (req, res, next) => {




//     try {
    
//       const {  title, description, type,offer_type ,discount_unit ,min_transaction_value ,discount_amount ,max_discount_value ,categories  , _id , user_id} = req.body;
//       const socket = io;
    
    
//       let getStore = await Store.findOne({user_id : user_id});
    
//       if(!getStore){
     
//       return res.send({ status: false, message: "Store Not Found" });
    
//       }

          
 


//       let pinData = {}
    
//       if(categories === 'LAST_MINUTE_PIN'){
//         pinData = {
//           title: title,
//           description :description,
//           discount_unit:discount_unit,
//           min_transaction_value:min_transaction_value,
//           discount_amount:discount_amount,
//           max_discount_value:max_discount_value,
//           categories:categories,
//           location: {
//             "type": "Point",
//             "coordinates": [
//               getStore.longitude , getStore.latitude
//             ]
//           },
//         latitude: getStore.latitude,
//         longitude: getStore.longitude,
//         store_id : getStore._id
    
          
//       }
    
//       }else   if(categories === 'FLAT_DISCOUNT_PIN'){
//         pinData = {
        
//           title: title,
//           description :description,
//           categories:categories,
//           location: {
//             "type": "Point",
//             "coordinates": [
//               getStore.longitude , getStore.latitude
//             ]
//           },
//         latitude: getStore.latitude,
//         longitude: getStore.longitude,
//         store_id : getStore._id
    
          
          
    
//       }
//       }
    
    

    
//       if(_id){
    
    
//     delete pinData.categories


//         let updated = await Pin.updateOne({ _id: _id }, pinData).lean().exec();
//                             const getAllPin = await Pin.find({is_published : true})

//       socket.emit('show_pins', { status: true, getAllPin: getAllPin })
//       return res.send({ status: true, message: 'pin updated successfully' });
    
    
//       }else{
     
    
    
//       const resultData = new Pin(pinData);
    

//       await resultData.save();

//                           const getAllPin = await Pin.find({is_published : true})

//   socket.emit('show_pins', { status: true, getAllPin: getAllPin })
//       return res.send({ status: true, message: 'pin created successfully' });
//       }
    
    
    
    
//     } catch (error) {
//       return res.send({ status: false, message: error.message });
//     }
//       });
// app.post('/api/delete-pin',authenticateJWT, setupSocket,   async (req, res, next) => {
//   try {
//     const { _id } = req.body;
// const socket = io;


//     if (!_id) return res.send({ message: "_id is required", status: false });

//     const data = await Pin.deleteOne({
      
//         _id: _id
      
//     });

//     if (!data) return res.send({ message: "Pin not found is required", status: false });

//     const getAllPin = await Pin.find({is_published : true})
//     socket.emit('show_pins', { status: true, getAllPin: getAllPin })

//     return res.send({ message: "Pin Deleted successfully!", status: true });

//   } catch (error) {
//     return res.status(400).send({ error: error.message, status: false });
//   }
// });
// app.post('/api/pin/status', setupSocket,   async (req, res, next) => {
//   try {
//       let {
//           id
//       } = req.body;

// const socket = io;

// console.log("this" ,this);




//       Pin.findById(id, async function (err, data) {
//           data.is_published = !data.is_published;

         


         

//           data.save(async (err, result) => {
//               if (result) {
//                   // let status = result.is_published ? 'Published' : 'UnPublished';
//                   // let msg_body = 'Hi, <br />';
//                   // msg_body += `Your account has been ${status} by your university<br />`;
//                   // // await Helper.sendEmail(result.email, 'Vivaquad App', msg_body)
//                   // let title = `Hi ${result.username}!`;
//                   // let body = `Your account has been ${status} by your university`;
//                   // let type = status
//                   // await sendPushNotificationToSingleUser("207", title, body, result.firebase_token, type);
//                   // let notificationData = {
//                   //     user_id: result._id,
//                   //     title: title,
//                   //     message: body,
//                   //     type: 'Verification',

//                   // }

//                   // const notificationModel = new Notification(notificationData);
//                   // await notificationModel.save();



//                     const getAllPin = await Pin.find({is_published : true})

//             let result =       socket.emit('show_pins', { status: true, getAllPin: getAllPin })
//             console.log("🚀 ~ file: p~ result:", result)



//                   return res.send({
//                       status: true,
//                       message: "Pin action changed successfully"
//                   });
//               } else {
//                   return res.send({
//                       status: false,
//                       message: err
//                   });
//               }
//           })
//       });

//   } catch (e) {
//       console.log(e);
//       return res.send({
//           status: false,
//           message: e.message
//       });
//   }
// })




// io.on('connection', async (socket) => {
//   console.log('Client connected');
//   let pin = await Pin.find()

//   socket.emit('show_pins', { status: true, getAllPin: pin })
//   socket.on('disconnect', () => {
//     console.log('Client disconnected');
//   });
// });

// //SOCKET CODE END





// /** 
//  * Listen on provided port, on all network interfaces. 
//  */

// server.listen(port);

// server.on('error', onError);
// server.on('listening', onListening);

// /** 
//  * Normalize a port into a number, string, or false.
//  */

// function normalizePort(val) {
//   var port = parseInt(val, 10);

//   if (isNaN(port)) {
//     // named pipe
//     return val;
//   }

//   if (port >= 0) {
//     // port number
//     return port;
//   }

//   return false;
// }

// /**
//  * Event listener for HTTP server "error" event.
//  */

// function onError(error) {
//   if (error.syscall !== 'listen') {
//     throw error;
//   }

//   var bind = typeof port === 'string' ?
//     'Pipe ' + port :
//     'Port ' + port;
//   // handle specific listen errors with friendly messages
//   switch (error.code) {
//     case 'EACCES':
//       console.error(bind + ' requires elevated privileges');
//       process.exit(1);
//       break;
//     case 'EADDRINUSE':
//       console.error(bind + ' is already in use');
//       process.exit(1);
//       break;
//     default:
//       throw error;
//   }
// }

// /**
//  * Event listener for HTTP server "listening" event.
//  */

// function onListening() {
//   var addr = server.address();
//   console.log(`🌎 Hunt Server is on port no ${port}`);

//   var bind = typeof addr === 'string' ?
//     'pipe ' + addr :
//     'port ' + addr.port;
//   debug('Listening on ' + bind);
// }




/**
 * Module dependencies.
 */




var app = require('../app');
var debug = require('debug')('backend:server');
var https = require('https');
var http = require('http');
var fs = require('fs');
var socket = require('../socket');


var https_options = {
  // key: fs.readFileSync("/Users/kalyansingh/Desktop/Project/vivaquad/admin-backend/backend-vivaquad/certificate/vivaquad.key"),
  // cert: fs.readFileSync("/Users/kalyansingh/Desktop/Project/vivaquad/admin-backend/backend-vivaquad/certificate/vivaquad.crt")

};

// var https_options = {
//   key: fs.readFileSync("/home/ubuntu/ssl-certs/vivaquad.key"),
//   cert: fs.readFileSync("/home/ubuntu/ssl-certs/vivaquad.crt")

//  };
/**hro
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '5000');
app.set('port', port);
/**
 * Create HTTP server.
 */









// var server = https.createServer(https_options, app);
var server = http.createServer(app);
socket(server ,app)

/** 
 * Listen on provided port, on all network interfaces. 
 */

server.listen(port);

server.on('error', onError);
server.on('listening', onListening);








/** 
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }
    console.log("🚀 ~ file: www.js:583 ~ onError ~ error:", error)

  var bind = typeof port === 'string' ?
    'Pipe ' + port :
    'Port ' + port;
  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  console.log(`🌎 Hunt Server is on port no ${port}`);

  var bind = typeof addr === 'string' ?
    'pipe ' + addr :
    'port ' + addr.port;
    
  debug('Listening on ' + bind);
}




