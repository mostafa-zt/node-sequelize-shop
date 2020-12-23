const bcrypt = require('bcryptjs');;
const { check, validationResult, body } = require('express-validator');
// const sgMail = require('@sendgrid/mail');
const User = require('../models/user');
const utility = require('../util/utility');

// sgMail.setApiKey('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');
exports.getsignup = (req, res, next) => {
    const cartQuantity = req.cart;
    console.log(req.session.isLoggedIn);
    res.render('auth/signup', {
        pageTitle: 'Signup',
        path: '/signup/',
        errorMessages: [],
        oldInputes: {
            email: null,
            password: null,
            confirmPassword: null
        }
    });
};
exports.postsignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const errors = validationResult(req).array();
    if (errors.length > 0) {
        return res.status(422).render('auth/signup', {
            pageTitle: 'Signup',
            path: '/signup/',
            errorMessages: errors,
            oldInputes: {
                email: email,
                password: null,
                confirmPassword: null
            }
        });
    }
    bcrypt.hash(password, 6)
        .then(hashedPass => {
            return User.create({
                userEmail: email,
                userPassword: hashedPass,
                isAdmin: false,
            });
        })
        .then(user => {
            req.flash('isUserSignedupSuccessfully', 'New user has been created successfully! please login with your username and password.');
            res.redirect('/login/');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
};
exports.getLogin = (req, res, next) => {
    let messages = [];
    const isUserSignedupSuccessfully = req.flash('isUserSignedupSuccessfully')[0]
    if (isUserSignedupSuccessfully) {
        messages.push({
            value: 'success',
            msg: isUserSignedupSuccessfully,
            param: 'User Registered!',
            location: ''
        })
    }
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login/',
        errorMessages: messages,
        isUserSignedupSuccessfully: isUserSignedupSuccessfully ? true : false
    });
};
exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let errors = validationResult(req).array();
    if (errors.length > 0) {
        return res.status(422).render('auth/login', {
            pageTitle: 'Login',
            path: '/login/',
            errorMessages: errors,
            oldInputes: {
                email: email,
                password: password
            },
            isUserSignedupSuccessfully: false
        });
    }
    User.findOne({ where: { userEmail: email } })
        .then(user => {
            if (!user) {
                errors.push({
                    value: '',
                    msg: 'There is not any account with this email!',
                    param: 'email',
                    location: 'body'
                });
                return res.status(422).render('auth/login', {
                    pageTitle: 'Login',
                    path: 'login',
                    errorMessages: errors,
                    oldInputes: {
                        email: email,
                        password: password
                    },
                    isUserSignedupSuccessfully: false
                });
            }
            bcrypt.compare(password, user.userPassword)
                .then(doMatch => {
                    if (doMatch) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save((result) => {
                            res.redirect('/');
                        });
                    }
                    else {
                        errors.push({
                            value: '',
                            msg: 'Email or password is invalid!',
                            param: 'email',
                            location: 'body'
                        });
                        errors.push({
                            value: '',
                            msg: 'Email or password is invalid!',
                            param: 'password',
                            location: 'body'
                        });
                        return res.status(422).render('auth/login', {
                            pageTitle: 'Login',
                            path: 'login',
                            errorMessages: errors,
                            oldInputes: {
                                email: email,
                                password: password
                            },
                            isUserSignedupSuccessfully: false
                        });
                    }
                }).catch(err => {
                    const error = new Error(err);
                    error.httpStatusCode = 500;
                    return next(error);
                })
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
};
exports.getlogout = (req, res, next) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};