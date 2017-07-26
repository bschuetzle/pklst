
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

// temp checkbox testing
app.get('/checkbox', function homepage(req, res) {
   res.sendFile(__dirname + '/views/checkbox.html');
});


/**************
 * API ROUTES *
 **************/

 // "GET" api for all orders
 app.get('/api/orders', controllers.orders.index);

 // "GET" api for single order by order number
 app.get('/api/orders/:order_num', controllers.orders.find);

 // "GET" api for all items
 app.get('/api/items', controllers.items.index);

 // "GET" api for all ordered items
 app.get('/api/ordered_items/:order_num', controllers.picklists.index);


/**********
 * SERVER *
 **********/

// listen on the port that Heroku prescribes (process.env.PORT) OR port 3000
app.listen(process.env.PORT || 3000, function () {
  console.log('Express server is up and running on http://localhost:3000/');
});
