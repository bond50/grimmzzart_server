const {check} = require("express-validator");
const Transaction = require('../models/transaction');

exports.createTransactionValidationRules = [
    check('amount')
        .notEmpty().withMessage('Transaction amount is required')
        .isNumeric().withMessage('Transaction amount must be a number'),
    check('wallet')
        .notEmpty().withMessage('Transaction wallet ID is required')
        .custom(async (value) => {
            const transactionExists = await Transaction.findOne({wallet: value});
            if (transactionExists) {
                return Promise.reject('A transaction already exists for this wallet');
            }
        }),
    check('description')
        .notEmpty().withMessage('Transaction description is required')
        .isLength({max: 500}).withMessage('Transaction description must not exceed 500 characters')
];

exports.getTransactionValidationRules = [
    check('id')
        .notEmpty().withMessage('Transaction ID is required')
        .isMongoId().withMessage('Transaction ID is not valid')
];

exports.updateTransactionValidationRules = [
    check('id')
        .notEmpty().withMessage('Transaction ID is required')
        .isMongoId().withMessage('Transaction ID is not valid'),
    check('amount')
        .optional()
        .isNumeric().withMessage('Transaction amount must be a number'),
    check('description')
        .optional()
        .isLength({max: 500}).withMessage('Transaction description must not exceed 500 characters')
];
exports.deleteTransactionValidationRules = [
    check('id')
        .notEmpty()
        .withMessage('Transaction ID is required')
        .isMongoId()
        .withMessage('Transaction ID is not valid')];
