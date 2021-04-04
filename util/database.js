const { Sequelize } = require('sequelize');
const config = require('../config/config').get(process.env.NODE_ENV);

if (process.env.NODE_ENV === 'production') {
  var sequelize = new Sequelize(config.DATABASE, config.USERNAME, config.PASSWORD, {
    dialect: "mssql",
    host: config.HOST,
    dialectOptions: {
      // instanceName: 'MSSQLSERVER01',
      // Use this if you're on Windows Azure
      encrypt: true
    },
  });
} else {
  // setup a new database using local database sqllite 
  var sequelize = new Sequelize("database", 'sa', '1',
    {
      host: "0.0.0.0",
      dialect: "sqlite",
      pool: {
        max: 5,
        min: 0,
        idle: 10000
      },
      // Data is stored in the file `database.sqlite` in the folder `db`.
      // Note that if you leave your app public, this database file will be copied if
      // someone forks your app. So don't use it to store sensitive information.
      storage: "database.sqlite"
    }
  );

}

module.exports = sequelize;