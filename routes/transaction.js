const express = require('express');
const router = express.Router();
const {body} = require('express-validator');

const {
    createTransaction,
    getTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionsForWallet
} = require('../controllers/transaction');

const {
    createTransactionValidationRules,
    getTransactionValidationRules,
    updateTransactionValidationRules,
    deleteTransactionValidationRules,

} = require('../validators/transaction');

const {runValidation} = require('../validators');
const {requireSignin, authCheck} = require('../middlewares/auth');
const {authorize} = require("../middlewares/authorize");

// Create transaction
router.post('/transactions',
    requireSignin,
    authCheck,
    authorize('create', 'Transaction'),
    createTransactionValidationRules,
    runValidation,
    createTransaction
);

// Get transaction by ID
router.get('/transactions/:id',
    requireSignin,
    authCheck,
    authorize('read', 'Transaction'),
    getTransactionValidationRules,
    runValidation,
    getTransaction
);

// Update transaction by ID
router.put('/transactions/:id',
    requireSignin,
    authCheck,
    authorize('update', 'Transaction'),
    updateTransactionValidationRules,
    runValidation,
    updateTransaction
);

// Delete transaction by ID
router.delete('/transactions/:id',
    requireSignin,
    authCheck,
    authorize('delete', 'Transaction'),
    deleteTransactionValidationRules,
    runValidation,
    deleteTransaction
);

// Get all transactions for a wallet
router.get('/transactions/wallet/:walletId',
    requireSignin,
    authCheck,
    getTransactionsForWallet
);

module.exports = router;
