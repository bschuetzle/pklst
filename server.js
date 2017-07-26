
/*********
 * SETUP *
 *********/

// import node packages
var express = require('express');
var Sequelize = require('sequelize')
var sql = require("mssql");

// import objects from other directories
var db = require('./models');  // connect to the sql server database
var controllers = require('./controllers');
// var conn = require('./models/db.js');

// set express app
var app = express();


/***************
 * VIEW ROUTES *
 ***************/

// serve static files from the public directory (images, scrips, styles, etc.)
app.use(express.static('public'));

// serve homepage view
app.get('/', function homepage(req, res) {
   res.sendFile(__dirname + '/views/index.html');
});


/**************
 * API ROUTES *
 **************/

 // "GET" api for all orders
 app.get('/api/orders', controllers.orders.index);


/**********
 * SERVER *
 **********/

// listen on the port that Heroku prescribes (process.env.PORT) OR port 3000
app.listen(process.env.PORT || 3000, function () {
  console.log('Express server is up and running on http://localhost:3000/');
});
