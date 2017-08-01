var db = require('../models');

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
