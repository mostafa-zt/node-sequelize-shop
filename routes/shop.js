const express = require('express');
const shopController = require('../controllers/shop');
const isAuth = require('../middleware/isAuth');

const router = express.Router();

//Home Page
router.get('/', shopController.getIndex);
router.get('/product-detail/:productId', shopController.getProductDetail);
router.get('/addToCart/:productId', shopController.addToCart);
router.get('/decreaseQty/:cartItemId',isAuth, shopController.getDecreaseQty);
router.get('/cart/',isAuth, shopController.getCart);
router.get('/order/',isAuth, shopController.getOrder);
router.get('/checkout/',isAuth, shopController.getCheckout);
router.post('/checkout/',isAuth, shopController.postCheckout);
router.get('/checkout/success/',isAuth, shopController.getCheckoutSuccess);
router.get('/checkout/cancel/',isAuth, shopController.getCheckoutCancel);
router.get('/invoice/:orderId',isAuth, shopController.getInvoice);

module.exports = router;