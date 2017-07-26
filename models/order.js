var Sequelize = require('sequelize');
var db = require('./db');

var Order = db.define('orders', {
  orderNumber: Sequelize.STRING,
  customerName: Sequelize.STRING
})

module.exports = Order;
