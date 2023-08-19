const express = require('express');
const {requireSignin, authCheck, adminCheck} = require('../middlewares/auth');
const {authorize} = require("../middlewares/authorize");
const {
    listOrders,
    getOrder,
    updateOrderStatus,
    deleteOrder,
    getTotalOrders,
    getTotalAmount
} = require('../controllers/order');

const router = express.Router();

router.get('/orders', requireSignin, authCheck, adminCheck, authorize('read', 'Order'), listOrders);
router.get('/total-orders', requireSignin, authCheck, adminCheck, authorize('read', 'Order'), getTotalOrders);
router.get('/total-amount', requireSignin, authCheck, adminCheck, getTotalAmount);
router.get('/orders/:id', requireSignin, authCheck, adminCheck, authorize('read', 'Order'), getOrder);
router.put('/orders/:id/status', requireSignin, authCheck, adminCheck, authorize('update', 'Order'), updateOrderStatus);
router.delete('/orders/:id', requireSignin, authCheck, adminCheck, authorize('delete', 'Order'), deleteOrder);

module.exports = router;
