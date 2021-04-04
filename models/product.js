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
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    productDescription: {
        type: DataTypes.STRING(1000),
        allowNull: true,
    },
    productImageUrl: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    productImagePublicId: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = Product;