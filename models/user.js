const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../util/database');

const User = sequelize.define('user', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        unique: true,
        primaryKey: true
    },
    userName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    userEmail: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    userPassword: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    }
});

module.exports = User;