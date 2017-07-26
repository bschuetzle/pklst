var db = require('../models');
var conn = require('../models/db.js');
var controllers = require('../controllers');

function index(req, res) {

  orderNumber = req.params.order_num;
  var queryString = `
    SELECT
      T1.id as orderID,
    	T1.orderNumber,
    	T1.customerName,
      T3.id as itemID,
    	T3.itemNumber,
    	T3.description,
    	T2.itemType,
    	T2.orderedQty,
    	T2.pickedQty
    FROM
      orders T1
      INNER JOIN ordered_items T2 ON T1.id = T2.orderID
      INNER JOIN items T3 ON T2.itemID = T3.id
    WHERE
      T1.orderNumber = '${orderNumber}'
      `

  conn.query(queryString, { type: conn.QueryTypes.SELECT })
    .then(picklist => {
      res.send(picklist)
    })

}

function update(req, res) {

  orderID = req.params.order_id;
  itemID = req.params.item_id;
  pickedQty = req.params.picked_qty;
  // var updatedItem = req.body;
  db.OrderedItem.update({
      pickedQty: pickedQty,
    }, {
      where: {
        orderID: orderID,
        itemID: itemID
      }
    }
  )
  .then(updatedItem => {
    res.send(updatedItem)
  })

}



module.exports = {
  index: index,
  update: update
};
