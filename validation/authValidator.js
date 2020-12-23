const { check, validationResult, body } = require('express-validator');
const User = require('../models/user');

class AuthValidator {
    static checkSignup() {
        return [
            body('email', 'Email is not valid!')
                .isEmail()
                .custom((value, { req }) => {
                    if (value === 'test@test.com' || value === 'test@test.test') {
                        throw new Error('This email address is forbidden! try another valid email address!');
                    }
                    return User.findOne({ userEmail: value })
                        .then(userDoc => {
                            if (userDoc) {
                                return Promise.reject('This email address is already being used! email should be unique. try another email address!');
                            }
                        });
                })
                .isLowercase().trim().normalizeEmail({ all_lowercase: true, gmail_remove_dots: false  }),
            body('password', 'Password is not valid! it should be between 5 and 10 character!')
                .isLength({ min: 5, max: 10 })
                .isAlphanumeric().withMessage('Password in not valid! it should contain alphabet and number!'),
            body('confirmPassword', 'Password is not match!').custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Password is not match!');
                }
                return true;
            }),
        ]
    }
    static checkLogin() {
        return [
            body('email', 'Email is not valid!')
                .isEmail()
                .isLowercase().trim()
        ]
    }
}

module.exports = AuthValidator;