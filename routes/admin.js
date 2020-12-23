const express = require('express');
const adminController = require('../controllers/admin');
const isAuth = require('../middleware/isAuth');
const AdminValidator = require('../validation/adminValidator');

const router = express.Router();
router.get('/add-product/', isAuth, adminController.getAddProduct);
router.post('/add-product/', AdminValidator.checkAddEditProduct(), isAuth, adminController.postAddProduct);
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);
router.post('/edit-product/', AdminValidator.checkAddEditProduct(), isAuth, adminController.postEditProduct);
router.get('/removeProduct/:productId', isAuth, adminController.postRemoveProduct);
router.get('/products/', isAuth, adminController.getProductList);

module.exports = router;