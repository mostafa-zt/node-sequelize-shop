const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../util/database');

const Product = require('../models/product');
const Cart = require('../models/cart');

const CartItem = sequelize.define('cartItem', {
    cartItemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        unique: true,
        primaryKey: true
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    cartId: {
        type: DataTypes.INTEGER,
        references: {
            model: Cart,
            key: 'cartId'
        },
        allowNull: false,
    },
    productId: {
        type: DataTypes.INTEGER,
        references: {
            model: Product,
            key: 'productId'
        },
        allowNull: false,
    }
});

module.exports = CartItem;