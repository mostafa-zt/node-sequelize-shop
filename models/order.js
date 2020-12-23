const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../util/database');

const Order = sequelize.define('order', {
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        unique: true,
        primaryKey: true
    },
    orderName:{
        type: DataTypes.STRING,
        allowNull: false
    },
    orderAddress:{
        type: DataTypes.STRING,
        allowNull: false
    },
    orderPhone:{
        type: DataTypes.STRING,
        allowNull: false
    },
    orderPrice:{
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    orderTrackingNumber:{
        type: DataTypes.STRING,
        allowNull: false
    },
    success: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    }
});

module.exports = Order;