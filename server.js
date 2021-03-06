
/*********
 * SETUP *
 *********/

// import node packages
var express = require('express');
var Sequelize = require('sequelize')
var sql = require("mssql");
var bodyParser = require('body-parser');
var multer = require('multer');


// import objects from other directories
var db = require('./models');  // connect to the sql server database
var controllers = require('./controllers');

// set express app
var app = express();

app.use(bodyParser.urlencoded({ extended: true }));

// require express-fileupload for image uploads
const fileUpload = require('express-fileupload');
app.use(fileUpload());



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

 // "GET" api for single order by order number
 app.get('/api/orders/:order_num', controllers.orders.find);

 // "GET" api for all items
 app.get('/api/items', controllers.items.index);

 // "GET" api for all ordered items
 app.get('/api/ordered_items/:order_num', controllers.picklists.index);

 // "PUT" api for single pick list item
 app.put('/api/picked_items/:order_id/:item_id/:picked_qty', controllers.picklists.update);

 // "POST" api to upload picked items image
 app.post('/api/uploadimage/:order_id', controllers.orders.upload);

 // "POST" api to update order status
 app.post('/api/order_update/:order_id', controllers.orders.update);



/**********
 * SERVER *
 **********/

// listen on the port that Heroku prescribes (process.env.PORT) OR port 3000
app.listen(process.env.PORT || 3000, function () {
  console.log('Express server is up and running on http://localhost:3000/');
});
