const Transaction = require('../models/transaction')
exports.createTransaction = async (req, res) => {
    try {
        const transaction = new Transaction(req.body);
        await transaction.save();
        res.status(201).json({transaction});
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};

// Get transaction by ID
exports.getTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) {
            res.status(404).json({error: 'Transaction not found'});
        } else {
            res.json({transaction});
        }
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};

// Update transaction by ID
exports.updateTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {new: true});
        if (!transaction) {
            res.status(404).json({error: 'Transaction not found'});
        } else {
            res.json({transaction});
        }
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};

// Delete transaction by ID
exports.deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findByIdAndDelete(req.params.id);
        if (!transaction) {
            res.status(404).json({error: 'Transaction not found'});
        } else {
            res.json({message: 'Transaction deleted successfully'});
        }
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};

// Get all transactions for a wallet
exports.getTransactionsForWallet = async (req, res) => {
    try {
        const transactions = await Transaction.find({wallet: req.params.walletId});
        res.json({transactions});
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};