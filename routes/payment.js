const express = require('express')
const {
    createPaymentIntent,
    lipaNaMpesaOnline,
    lipaNaMpesaOnlineCallback,
    lipaNaMpesaTrace
} = require('../controllers/payment')
const router = express.Router()


const {requireSignin, authCheck} = require('../middlewares/auth')
const {getOAuthToken} = require("../middlewares/safaricom");

//stripe
router.post('/create-payment-intent', requireSignin, authCheck, createPaymentIntent)
router.post('/create-payment-intent-stripe', requireSignin, authCheck, createPaymentIntent)
router.post('/create-payment-daraja', requireSignin, authCheck, createPaymentIntent)
//mpesa
// router.post('/daraja-create-payment-intent', requireSignin, authCheck, getOAuthToken, createPaymentIntent)
router.post('/callback', lipaNaMpesaOnlineCallback)
// router.post('/lipa-na-mpesa-trace', getOAuthToken, lipaNaMpesaTrace)


module.exports = router
