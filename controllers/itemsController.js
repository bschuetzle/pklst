var db = require('../models');
var controllers = require('../controllers');

function index(req, res) {

  db.Item.findAll({
    })
    .then(items => {
      res.json(items)
    })

}

module.exports = {
  index: index
};
