const path = require('path');
const { check, validationResult, body } = require('express-validator');
const Product = require('../models/product');
const utility = require('../util/utility');
const CartItem = require('../models/cartItem');
const cloudinaryUtility = require('../util/cloudinaryUtility');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/add-product', {
        pageTitle: 'ADMIN - Add Product',
        path: '/admin/add-product/',
        errorMessages: [],
        oldInputes: {
            productTitle: null,
            productPrice: null,
            productDescription: null,
        },
    });
};
exports.postAddProduct = (req, res, next) => {
    const user = req.user;
    const productTitle = req.body.productTitle;
    const productPrice = req.body.productPrice ? parseFloat(req.body.productPrice) : null;
    const productDescription = req.body.productDescription;
    const image = req.file;
    let errors = validationResult(req).array();
    if (!image) {
        errors.push({
            value: '',
            msg: 'Image is not valid!',
            param: 'file',
            location: 'body'
        });
        return res.status(422).render('admin/add-product', {
            pageTitle: 'ADMIN - Add Product',
            path: 'admin/add-product',
            errorMessages: errors,
            oldInputes: {
                productTitle: productTitle,
                productPrice: productPrice,
                productDescription: productDescription,
            },
        });
    }
    if (errors.length > 0) {
        return res.status(422).render('admin/add-product', {
            pageTitle: 'ADMIN - Add Product',
            path: 'admin/add-product',
            errorMessages: errors,
            oldInputes: {
                productTitle: productTitle,
                productPrice: productPrice,
                productDescription: productDescription,
            },
        });
    }
    // const imageUrl = path.join('/', image.path);
    cloudinaryUtility.streamUpload(image).then(result => {
        return Product.create({
            productTitle: productTitle,
            productPrice: productPrice,
            productDescription: productDescription,
            productImageUrl: result.url,
            productImagePublicId: result.public_id,
            userId: user.userId
        });
    }).then(result => {
        res.redirect('/admin/products/');
    }).catch(err => {
        // const error = new Error(err);
        // error.httpStatusCode = 500;
        // return next(error);
        console.log(err);
    });
};

exports.getEditProduct = (req, res, next) => {
    const productId = req.params.productId;
    Product.findByPk(productId).then(product => {
        res.render('admin/edit-product', {
            pageTitle: `ADMIN - Edit Product ${product.productTitle}`,
            path: '/admin/products/',
            errorMessages: [],
            oldInputes: {
                productTitle: product.productTitle,
                productPrice: product.productPrice,
                productDescription: product.productDescription,
                productId: product.productId
            },
        });
    })
}
exports.postEditProduct = (req, res, next) => {
    const productId = req.body.productId;
    const productTitle = req.body.productTitle;
    const productPrice = req.body.productPrice ? parseFloat(req.body.productPrice) : null;
    const productDescription = req.body.productDescription;
    const image = req.file;
    let errors = validationResult(req).array();
    if (errors.length > 0) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'ADMIN - Add Product',
            path: 'admin/add-product',
            errorMessages: errors,
            oldInputes: {
                productTitle: productTitle,
                productPrice: productPrice,
                productDescription: productDescription,
                _id: productId
            },
        });
    }
    let product;
    Product.findByPk(productId)
        .then(prod => {
            prod.productTitle = productTitle;
            prod.productPrice = productPrice;
            prod.productDescription = productDescription;
            product = prod;
            if (image) {
                cloudinaryUtility.removeFile(prod.productImagePublicId);
                return cloudinaryUtility.streamUpload(image);
            }
        }).then(result => {
            if (result) {
                product.productImageUrl = result.url;
                product.productImagePublicId = result.public_id;
            }
            product.save();
            res.redirect('/admin/products/');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}
exports.getProductList = (req, res, next) => {
    Product.findAll()
        .then(result => {
            res.render('admin/products', {
                products: result,
                pageTitle: 'ADMIN - Product List',
                path: '/admin/products/',
            });
        }).catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};
exports.postRemoveProduct = (req, res, next) => {
    const productId = +req.params.productId;
    let productImagePublicId;
    CartItem.destroy({
        where: {
            productId: productId
        }
    }).then(result => {
        Product.findByPk(productId)
            .then(product => {
                return product;
            })
            .then(product => {
                productImagePublicId = product.productImagePublicId;
                return product.destroy();
            })
            .then(result => {
                // utility.deleteFile(productImageUrl);
                cloudinaryUtility.removeFile(productImagePublicId);
                res.status(200).json({ success: true });
            })
            .catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
    })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

