const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { check, validationResult, body } = require('express-validator');
const stripe = require('stripe')('sk_test_51HyqDyB64RoBKGh8IU6zHriFpW17QZ7cnLsO8TMaYAiyg74hxdDSD9rKyt0m8xs9wFBbzcnUb0nPWr9Pj3Yan15600PU6kknKB');
const Cart = require('../models/cart');
const CartItem = require('../models/cartItem');
const Order = require('../models/order');
const OrderItem = require('../models/orderItems');
const Product = require('../models/product');
const utility = require('../util/utility');
const User = require('../models/user');

const ITEMS_PER_PAGE = 2;
exports.getIndex = (req, res, next) => {
    const page = +req.query.page || 1;
    let totalDocs = 0;
    Product.count()
        .then(numberOfDocs => {
            totalDocs = numberOfDocs;
            const offSet = (page - 1) * ITEMS_PER_PAGE;
            const limit = ITEMS_PER_PAGE;
            // Skip [offset] instances and fetch the [limit] after that
            return Product.findAll({ offset: offSet, limit: limit })
        })
        .then(products => {
            res.render('shop/index', {
                products: products,
                pageTitle: 'Shop - Home Page',
                path: '/',
                totalProducts: totalDocs,
                currenPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalDocs,
                nextPage: page + 1,
                hasPreviousPage: page > 1,
                previousPage: page - 1,
                hasFirstPage: page > 1,
                firstPage: 1,
                hasLastPage: ITEMS_PER_PAGE * page < totalDocs,
                lastPage: Math.ceil(totalDocs / ITEMS_PER_PAGE),
                numberOfPages: Math.ceil(totalDocs / ITEMS_PER_PAGE)
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};
exports.getCart = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login/');
    }
    const user = req.user;
    let productPriceInQty = 0;
    let totalPriceCart = 0;
    Cart.findOne({ where: { userId: user.userId } })
        .then(cart => {
            if (cart) {
                return cart.getCartItems({ include: Product });
            }
            return [];
        })
        .then(cartItems => {
            let data = [];
            let totalPrice = 0;
            return cartItems.map(cartItem => {
                productPriceInQty = cartItem.product.productPrice * cartItem.quantity;
                totalPriceCart = totalPriceCart + productPriceInQty;
                return {
                    product: {
                        productPrice: utility.formatMoney(cartItem.product.productPrice),
                        productTitle: cartItem.product.productTitle,
                        productDescription: cartItem.product.productDescription,
                    },
                    cartItemId: cartItem.cartItemId,
                    productQuantity: cartItem.quantity,
                    productPriceInQty: utility.formatMoney(productPriceInQty),
                }
            });
        })
        .then(result => {
            const data = { cartItems: [...result], totalPriceCart: utility.formatMoney(totalPriceCart) };
            return data;
        })
        .then(result => {
            res.render('shop/cart', {
                pageTitle: 'Shop - Cart',
                path: '/cart/',
                cart: result
            })
        });
};
exports.getProductDetail = (req, res, next) => {
    const productId = req.params.productId;
    const cartQuantity = req.cart;
    Product.findByPk(productId).then(result => {
        res.render('shop/product-detail', {
            product: result,
            pageTitle: `Shop - Product Detail ${result.productTitle}`,
            path: '/product-detail/'
        });
    });
};
exports.getDecreaseQty = (req, res, next) => {
    const cartItemId = +req.params.cartItemId;
    const user = req.user;
    let productPriceInQty = 0;
    let totalPriceCart = 0;
    let newQty = 0
    let newProductPriceInQty = 0;
    let cartQuantity = 0;
    Cart.findOne({ where: { userId: user.userId } })
        .then(cart => {
            return cart.getCartItems({ include: Product });
        })
        .then(cartItems => {
            cartItems.forEach(cartItem => {
                if (cartItem.cartItemId === cartItemId) {
                    newQty = cartItem.quantity - 1;
                    cartItem.quantity = newQty;
                    productPriceInQty = cartItem.product.productPrice * cartItem.quantity;
                    newProductPriceInQty = productPriceInQty;
                    if (newQty === 0) {
                        cartItem.destroy();
                    } else {
                        cartItem.save();
                    }
                }
                else {
                    productPriceInQty = cartItem.product.productPrice * cartItem.quantity;
                }
                totalPriceCart = totalPriceCart + productPriceInQty;
            });
            cartQuantity = cartItems.filter(c => c.quantity > 0).length;
        })
        .then(result => {
            res.json({
                success: true,
                quantity: newQty,
                cartItemId: cartItemId,
                newPriceInQty: utility.formatMoney(newProductPriceInQty),
                totalPrice: utility.formatMoney(totalPriceCart),
                cartQuantity: cartQuantity
            });
        });
};
exports.addToCart = async (req, res, next) => {
    const productId = req.params.productId;
    const user = req.user;
    let cartQuantity = parseInt(req.cart);
    // FINDING EXISTING CART OF USER
    let cart = await Cart.findOne({ where: { userId: user.userId }, include: CartItem });
    if (cart === null && !(cart instanceof Cart)) {
        let newCart = { userId: user.userId }
        cart = await Cart.create(newCart);
    }
    let newQTY = 1;
    const cartItem = await CartItem.findOne({ where: { productId: productId, cartId: cart.cartId } });
    if (cartItem === null && !(cartItem instanceof CartItem)) {
        CartItem.create({
            quantity: newQTY,
            cartId: cart.cartId,
            productId: productId
        }).then(result => {
            return Cart.findOne({ where: { userId: user.userId }, include: CartItem });
        }).then(cart => {
            cartQuantity = cart.cartItems.length;
            res.json({ success: true, quantity: cartQuantity });
        }).catch(err => console.log(err));
    }
    else {
        newQTY = cartItem.quantity + 1;
        cartItem.quantity = newQTY;
        cartItem.save()
            .then(result => {
                console.log(`result UPDATE CARTITEM = ${result}`);
                return Cart.findOne({ where: { userId: user.userId }, include: CartItem });
            }).then(cart => {
                cartQuantity = cart.cartItems.length
                res.json({ success: true, quantity: cartQuantity });
            }).catch(err => console.log(err));
    }
};
exports.getOrder = (req, res, next) => {
    const user = req.user;
    Order.findAll({ where: { success: true, userId: user.userId }, include: OrderItem }).then(orders => {
        res.render('shop/orders', {
            pageTitle: 'Shop - Order List',
            path: '/order/',
            orders: orders
        });
    });
};
exports.getCheckout = (req, res, next) => {
    const user = req.user;
    if (!req.session.isLoggedIn) {
        return res.redirect('/login/');
    }
    let productPriceInQty = 0;
    let totalPriceCart = 0;
    Cart.findOne({ where: { userId: user.userId } })
        .then(cart => {
            if (cart) {
                return cart.getCartItems({ include: Product });
            }
            return [];
        })
        .then(cartItems => {
            return cartItems.map(cartItem => {
                productPriceInQty = cartItem.product.productPrice * cartItem.quantity;
                totalPriceCart += productPriceInQty;
                return {
                    product: {
                        productPrice: utility.formatMoney(cartItem.product.productPrice),
                        productTitle: cartItem.product.productTitle,
                        productDescription: cartItem.product.productDescription,
                        productImageUrl: cartItem.product.productImageUrl
                    },
                    cartItemId: cartItem.cartItemId,
                    productQuantity: cartItem.quantity,
                    productPriceInQty: utility.formatMoney(productPriceInQty),
                }
            });
        })
        .then(result => {
            const data = { cartItems: [...result], totalPriceCart: utility.formatMoney(totalPriceCart) };
            return data;
        })
        .then(cart => {
            res.render('shop/checkout', {
                pageTitle: 'Shop - Checkout',
                path: '/cart/',
                cart: cart,
            });
        });
};
// Post Checkout Ajax - Asynchronous Javascript Request
exports.postCheckout = (req, res, next) => {
    const user = req.user;
    const address = req.query.address;
    const phone = req.query.phone;
    const name = req.query.name;
    let orderPrice = 0;
    let productPriceInQty = 0;
    if (!utility.isNumeric(phone) || !address || !name) {
        return res.json({
            success: false,
            sessionId: null
        });
    }
    Cart.findOne({ where: { userId: user.userId } })
        .then(cart => {
            return cart.getCartItems({ include: Product });
        })
        .then(cartItems => {
            const orderItems = cartItems.map(cartItem => {
                productPriceInQty = cartItem.product.productPrice * cartItem.quantity;
                orderPrice = orderPrice + productPriceInQty;
                const result = {
                    productTitle: cartItem.product.productTitle,
                    productPrice: cartItem.product.productPrice,
                    productDescription: cartItem.product.productDescription,
                    productImageUrl: cartItem.product.productImageUrl,
                    productQuantity: cartItem.quantity,
                    productPriceInQty: productPriceInQty
                };
                return result;
            });
            const order = {
                orderName: name,
                orderAddress: address,
                orderPhone: phone,
                orderPrice: orderPrice,
                orderTrackingNumber: utility.createGuid().substr(0, 13),
                orderItems: orderItems,
                success: false,
                userId: user.userId
            };
            return Order.create(order, { include: OrderItem });
        })
        .then(order => {
            newOrder = order;
            return stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'payment',
                line_items: order.orderItems.map(orderItem => {
                    return {
                        name: orderItem.productTitle,
                        amount: orderItem.productPrice * 100,
                        quantity: orderItem.productQuantity,
                        description: orderItem.productDescription,
                        currency: 'usd'
                    }
                }),
                success_url: req.protocol + '://' + req.get('host') + '/checkout/success/?orderId=' + order.orderId, // ==> http://localhost:3000
                cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel/', // ==> http://localhost:3000
            });
        })
        .then(session => {
            res.json({
                success: true,
                sessionId: session.id
            });
        });
};
exports.getCheckoutSuccess = (req, res, next) => {
    const user = req.user;
    const orderId = req.query.orderId;
    let _order;
    Order.findByPk(orderId, { include: OrderItem })
        .then(order => {
            order.success = true;
            return order.save();
        })
        .then(order => {
            _order = order;
            return Cart.findOne({ where: { userId: user.userId } });
        })
        .then(cart => {
            if (cart)
                cart.destroy();
            res.render('shop/checkout-success', {
                pageTitle: 'Shop - Checkout Success!',
                path: '/cart/',
                order: _order
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};
exports.getCheckoutCancel = (req, res, next) => {
};
exports.getInvoice = (req, res, next) => {
    const cartQuantity = req.cart;
    const user = req.user;
    const orderId = +req.params.orderId;
    const invoiceName = 'invoice' + '-' + orderId + '.pdf';
    const invoicePath = path.join('data', 'invoices', invoiceName);
    Order.findByPk(orderId, { include: OrderItem }).then(order => {
        if (!order) {
            return next(new Error('This invoice is not valid!'));
        }
        if (order.userId !== user.userId) {
            return next(new Error('User unauthorized!'));
        }
        const doc = new PDFDocument();
        const file = fs.createWriteStream(invoicePath);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename ="' + invoiceName + '"');
        doc.pipe(file);
        doc.pipe(res);
        // Header
        doc.fontSize(25).text(`Invoice #${order.orderTrackingNumber}`);
        doc.lineCap('round')
            .moveTo(50, 95)
            .lineTo(600, 95)
            .stroke("#afa79d").fillOpacity(0.8);

        doc.fontSize(12).text(`User Name : ${order.orderName}`).moveDown(0.5);
        doc.fontSize(12).text(`Address : ${order.orderAddress}`).moveDown(0.5);
        doc.fontSize(12).text(`Phone Number : ${order.orderPhone}`).moveDown(0.9);
        doc.fontSize(15).fillColor('#33065d').text(`Order Price : $${order.orderPrice}`).moveDown(1.5);
        let yMoveTo = 0;
        let y = 200;
        order.orderItems.forEach(orderItem => {
            doc.lineCap('round')
                .moveTo(50, y)
                .lineTo(600, y)
                .stroke("#afa79d").fillOpacity(0.8);
            // .fillAndStroke("red", "#900");
            doc.fontSize(14).fillColor('black').text(`Product Title : ${orderItem.productTitle}`).moveDown(0.5);
            doc.fontSize(12).fillColor('black').text(`Product Description : ${orderItem.productDescription}`).moveDown(0.5);
            doc.fontSize(12).fillColor('black').text(`Product Price : $${orderItem.productPrice}`).moveDown(0.5);
            // doc.image(orderItem.product.productImageUrl,0, 15, {width: 300})
            // .text('Proportional to width', 0, 0);
            doc.fontSize(12).fillColor('black').text(`QTY : ${orderItem.productQuantity}`).moveDown(0.5);
            // doc.lineCap('round')
            //     .moveTo(60, y + 90)
            //     .lineTo(200, y + 90)
            //     .stroke("red", "#900").fillOpacity(0.8)
            //     .fillAndStroke("red", "#900");
            doc.fontSize(12).fillColor('#afa79d').text('===================');
            doc.fontSize(12).fillColor('#33065d').text(`Total Price : $${orderItem.productPriceInQty}`).moveDown(2.2);
            // doc.lineCap('round')
            // .moveTo(50, 800)
            // .lineTo(600, 800)
            // .stroke("red", "#900").fillOpacity(0.8)
            // .fillAndStroke("red", "#900");
            y += 145;
        })
        doc.end();
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })
};
