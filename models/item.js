var Sequelize = require('sequelize');
var db = require('./db');

var Item = db.define('items', {
  itemNumber: Sequelize.STRING,
  description: Sequelize.STRING
})

module.exports = Item;
