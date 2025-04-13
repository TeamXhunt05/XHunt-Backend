const express = require('express');
const path = require('path');
const bodyParser = require('body-parser')
const cors = require('cors');
const indexRouter = require('./routes/index');
const app = express();
var logger = require('morgan');
// const scheduler = require('./helper/scheduler');

//USE FOR ENV
require('dotenv').config()


//LOGGER
app.use(logger('dev'));


// view engine setup
app.set('views', path.join(__dirname, '../src/views'));
app.set('view engine', 'ejs');

//scheduler for time table
// scheduler.scheduleAllJobs()
// scheduler.job()


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: false,
  limit: '50mb'
}));

// parse application/json
app.use(bodyParser.json({
  limit: '50mb'
}));

//Allow Cors
app.use(cors());

//Set Static Path
app.use(express.static(path.join(__dirname, '../public')));
app.use('/api', express.static(path.join(__dirname, `../public/`)));
app.use('/api', express.static(path.join(__dirname, `../public/stores/`)));
app.use('/api', express.static(path.join(__dirname, `../public/products/`)));
app.use('/api', express.static(path.join(__dirname, `../public/users/`)));




const staticPaths = ["stores", "products" ,]
// staticPaths.forEach(item => {
//   app.use('/api', express.static(path.join(__dirname, `../public/${item}/`)));
// })
// console.log("🚀 ~ file: app.js:48 ~ __dirname:", path.join(__dirname, `../public`))

//Set All Routes
app.use('/', indexRouter);

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send({message: err.message , status :err.status });
});



module.exports = app;