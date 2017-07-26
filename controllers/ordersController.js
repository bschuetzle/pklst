var db = require('../models');
var controllers = require('../controllers');

function index(req, res) {

  db.Order.findAll({
    })
    .then(orders => {
      res.json(orders)
    })

}

module.exports = {
  index: index
};
