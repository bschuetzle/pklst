
var Sequelize = require('sequelize')

const sequelize = new Sequelize('PKLST', 'sa', '4milkbon#', {
  host: 'localhost',
  dialect: 'mssql',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  }
});

sequelize
  .authenticate()
  .then(() => {
    console.log('SQL Server connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

sequelize
  .query("UPDATE dbo.ordered_items SET pickedQty = 0; UPDATE dbo.orders SET orderStatus = 'booked'; SELECT TOP 100 * FROM dbo.ordered_items;", { type: sequelize.QueryTypes.UPDATE })
  .then(update => {
    console.log("reset successfull");
  })
