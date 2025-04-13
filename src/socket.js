const pinController = require('./controllers/pinController')
const getAllPin = require('./helper/getPinHelper')
const authenticateJWT = require('./middlewares/authenticate')

const socketio = require('socket.io');
const socketHandler = (server ,app) => {
  const io = socketio(server,{
    cors: {
      origin: "*",
      // http://3.7.231.97
      methods: ["GET", "POST"],
  
    }
  });


  const setupSocket = (req, res, next) => {
    const socket = io
    req.socket = socket;
    next();
  };



// //FOR SOCKET
app.post('/api/add-edit-pin',authenticateJWT,setupSocket, pinController.addEditPin);
app.post('/api/admin/add-edit-pin',authenticateJWT, setupSocket,pinController.addEditPinAdmin);
app.post('/api/delete-pin',authenticateJWT, setupSocket, pinController.deletePin);
app.post('/api/pin/status', setupSocket, pinController.pinPublished)


io.on('connection', async (socket) => {
  console.log('Client connected');
  let pin = await getAllPin()


  socket.emit('show_pins', { status: true, getAllPin: pin })
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});




}


module.exports = socketHandler