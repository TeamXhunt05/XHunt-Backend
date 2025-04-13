#!/usr/bin/env node

/**
 * Module dependencies.
 */

var app = require('../app');
var {Pin} = require('../db/conn');


var debug = require('debug')('backend:server');
var https = require('https');
var http = require('http');
var fs = require('fs');
const socketio = require('socket.io');


// const socketioServer = require('../SocketIO/PinSocketIo');

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
const io = socketio(server,{
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],

  }
});


// Middleware function to set up Socket.io connection
const setupSocket = (req, res, next) => {
  const socket = io
  // Attach socket to the request object
  req.socket = socket;
  // Call next middleware function

  next();
};




// Create operation
app.post('/api/data', setupSocket,async(req, res) => {

  const newData = {name :  "Sachin"}
  const socket = req.socket;


  let pin = await Pin.find()
  let newAddPind = [...pin, {title : "sachin"}]

  // Emit a message to the client
  socket.emit('show_pins', { status: true, getAllPin: newAddPind })


  // Send a response to the client
  res.status(201).send({data: "add"});

  return
});


io.on('connection', async (socket) => {
  console.log('Client connected');
  let pin = await Pin.find()

  socket.emit('show_pins', { status: true, getAllPin: pin })
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

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



