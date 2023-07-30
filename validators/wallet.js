const {check} = require("express-validator");

exports.createWalletValidation = [
    check('owner')
        .exists().withMessage('Owner is required')
        .isMongoId().withMessage('Invalid owner ID format'),
    check('balance')
        .exists().withMessage('Balance is required')
        .isNumeric().withMessage('Balance must be a number'),
    check('currency')
        .exists().withMessage('Currency is required')
        .isString().withMessage('Currency must be a string')
        .trim()
        .isLength({min: 3, max: 3})
        .withMessage('Currency must be a 3-letter code')
];

exports.updateWalletValidation = [
    check('balance')
        .optional()
        .isNumeric()
        .withMessage('Balance must be a number'),
    check('currency')
        .optional()
        .isString()
        .withMessage('Currency must be a string')
        .trim()
        .isLength({min: 3, max: 3})
        .withMessage('Currency must be a 3-letter code'),
];
