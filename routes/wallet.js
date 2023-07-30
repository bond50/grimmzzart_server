const express = require('express');
const router = express.Router();

const {requireSignin, authCheck,} = require('../middlewares/auth');
const {runValidation} = require('../validators');
const { createWalletValidation, updateWalletValidation} = require('../validators/wallet');
const {createWallet, getWallet, transfer, updateWallet, deleteWallet} = require('../controllers/wallet');
const {authorize} = require("../middlewares/authorize");
router.post('/user/wallet', requireSignin, authCheck, authorize('create', 'Wallet'), createWalletValidation, runValidation, createWallet);
router.get('/user/wallet/:id', requireSignin, authCheck, authorize('read', 'Wallet'), runValidation, getWallet);
router.put('/user/wallet/:id', requireSignin, authCheck, authorize('update', 'Wallet'), updateWalletValidation, runValidation, updateWallet);
router.delete('/user/wallet/:id', requireSignin, authCheck, authorize('delete', 'Wallet'), runValidation, deleteWallet);
router.post('/user/wallet/transfer', requireSignin, authCheck, authorize('update', 'Wallet'), runValidation, transfer);

module.exports = router;
