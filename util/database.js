const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('mostafa1_shop', 'mostafa1_shop', 'rb1Pp^78', {
  dialect: "mssql",
  host: '185.187.51.11',
  dialectOptions: {
    // instanceName: 'MSSQLSERVER01',
    // Use this if you're on Windows Azure
    encrypt: true
  },
});

module.exports = sequelize; 