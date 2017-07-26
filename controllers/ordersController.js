var db = require('../models');
var controllers = require('../controllers');

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


module.exports = {
  index: index,
  find: find
};
