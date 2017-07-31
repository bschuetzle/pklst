var db = require('../models');
var controllers = require('../controllers');
const fileUpload = require('express-fileupload');


function index(req, res) {

  db.Order.findAll({
    })
    .then(orders => {
      res.json(orders)
    })

}


function find(req, res) {

  orderNumber = req.params.order_num;
  db.Order.findAll({
    where: {
      orderNumber: orderNumber
    }
    })
    .then(order => {
      res.json(order)
    })

}


function upload(req, res) {

  var orderID = req.params.order_id;
  var imageFile = req.files.file;
  var filename = Date.now().toString() + '_PICK_ORDERID_' + orderID.toString();
  
  db.Order.update({
      pickedItemsImgFile: filename,
    }, {
      where: {
        id: orderID
      }
    }
  )
  .then(updatedOrder => {

    moveDir = __dirname + '/../public/pick_images/'

    imageFile.mv(moveDir + filename, function(err) {
      console.log('File uploaded!')
    });

    res.send(updatedOrder)

  })

}


module.exports = {
  index: index,
  find: find,
  upload: upload
};
