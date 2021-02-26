const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('mostafa1_shop', 'mostafa1_shop', 'sqcC9%37', {
  dialect: "mssql",
  host: '185.187.51.11',
  dialectOptions: {
    // instanceName: 'MSSQLSERVER01',
    // Use this if you're on Windows Azure
    encrypt: true
  },
});

// setup a new database using local database sqllite 
// var sequelize = new Sequelize("database",'sa','1',
//   {
//     host: "0.0.0.0",
//     dialect: "sqlite",
//     pool: {
//       max: 5,
//       min: 0,
//       idle: 10000
//     },
//     // Data is stored in the file `database.sqlite` in the folder `db`.
//     // Note that if you leave your app public, this database file will be copied if
//     // someone forks your app. So don't use it to store sensitive information.
//     storage: "database.sqlite"
//   }
// );

module.exports = sequelize; 