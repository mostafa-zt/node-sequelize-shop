const { check, validationResult, body } = require('express-validator');

class AdminValidator {
    static checkAddEditProduct() {
        return [
            body('productTitle', 'Title is not valid! it should be between 2 and 250 alphabet and numeric character!')
                .isString()
                .isLength({ min: 2, max: 250 }).trim(),
            body('productPrice', 'Price is not valid!')
                 .isFloat(),
            body('productDescription', 'Description should be at least 2 character!')
            .isLength({min: 2}).trim()
        ]
    }
}

module.exports = AdminValidator;