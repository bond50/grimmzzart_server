const express = require('express')
const {create, remove, list, getCoupon, updateCoupon} = require('../controllers/coupon')
const router = express.Router()
const {adminCheck, requireSignin, authCheck} = require('../middlewares/auth')
const {authorize} = require("../middlewares/authorize");


router.post('/coupon', requireSignin, authCheck, adminCheck, authorize('create', 'Coupon'), create)
router.get('/coupons', requireSignin, authCheck, adminCheck, authorize('read', 'Coupon'), list);
router.get('/coupon/:couponId', requireSignin, authCheck, adminCheck, authorize('read', 'Coupon'), getCoupon);
router.put('/coupon/:id', requireSignin, authCheck, adminCheck, authorize('update', 'Coupon'), updateCoupon);
router.delete('/coupon/:couponId', requireSignin, authCheck, adminCheck, authorize('delete', 'Coupon'), remove);


module.exports = router
