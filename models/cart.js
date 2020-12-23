const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../util/database');

const Cart = sequelize.define('cart', {
    cartId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        unique: true,
        primaryKey: true
    }
});

module.exports = Cart;