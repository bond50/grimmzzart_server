const express = require('express')
const {
    userCart,
    saveAddress,
    getUserCart,
    orders,
    emptyCart,
    initiateMpesaOrder,
    getMpesaDetails,
    initiatePayPal,
    capturePayPalPaymentAndSavePaypalOrder,
    createStripeOrder,
    createMpesaOrder,
    applyCouponToUserCart,
    lipaNaMpesaTrace,
    verifyTokenController,
    addToWishList,
    wishList,
    removeFromWishlist,
    creatCashOrder,
} = require('../controllers/user')
const router = express.Router()


const {requireSignin, authCheck, verifyToken} = require('../middlewares/auth')
const {getOAuthToken} = require("../middlewares/safaricom");
const {authorize} = require("../middlewares/authorize");

router.post('/user/cart', requireSignin, authCheck, authorize('create', 'Cart'), userCart)
router.get('/user/cart', requireSignin, authCheck, authorize('read', 'Cart'), getUserCart)
router.delete('/user/cart', requireSignin, authCheck, authorize('delete', 'Cart'), emptyCart)
router.post('/user/address', requireSignin, authCheck, authorize('create', 'Delivery'), saveAddress)
router.post('/user/verifyToken', requireSignin, authCheck, saveAddress)
router.get('/user/orders', requireSignin, authCheck, authorize('read', 'Order'), orders)
router.post('/user/cart/coupon', requireSignin, authCheck, authorize('update', 'Cart'), applyCouponToUserCart)
router.post('/user/init-paypal-order', requireSignin, authCheck, initiatePayPal)
router.post('/user/capture-paypal-payment-and-save-order', requireSignin, authCheck, capturePayPalPaymentAndSavePaypalOrder)
router.post('/mpesa/callback', createMpesaOrder)
router.post('/user/stripe-order', requireSignin, authCheck, createStripeOrder)
// router.post('/user/cash-order', requireSignin, authCheck, creatCashOrder)
router.post('/user/initiate-mpesa-order', requireSignin, authCheck, getOAuthToken, initiateMpesaOrder)
router.get('/user/mpesa-trace', getOAuthToken, getMpesaDetails)

router.post('/user/wishlist', requireSignin, authCheck, authorize('create', 'WishList'), addToWishList)
router.get('/user/wishlist', requireSignin, authCheck, authorize('read', 'WishList'), wishList)
router.put('/user/wishlist/:productId', requireSignin, authorize('delete', 'WishList'), authCheck, removeFromWishlist)


module.exports = router
