var Sequelize = require('sequelize');
var db = require('./db');

var OrderedItem = db.define('ordered_items', {
  orderID: Sequelize.INTEGER,
  itemID: Sequelize.INTEGER,
  itemType: Sequelize.STRING,
  orderedQty: Sequelize.INTEGER,
  pickedQty: Sequelize.INTEGER
})

module.exports = OrderedItem;
