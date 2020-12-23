const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../util/database');
const Order = require('./order');

const OrderItem = sequelize.define('orderItems', {
    OrderItemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        unique: true,
        primaryKey: true
    },
    productTitle: {
        type: DataTypes.STRING
    },
    productPrice: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    productDescription: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    productImageUrl: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    productQuantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    productPriceInQty: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    orderId: {
        type: DataTypes.INTEGER,
        references: {
            model: Order,
            key: 'orderId'
        }
    }
});

module.exports = OrderItem;