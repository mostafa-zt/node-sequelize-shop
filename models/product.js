const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../util/database');

const Product = sequelize.define('product', {
    productId: {
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
    }
});

module.exports = Product;