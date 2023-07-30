const express = require('express');
const router = express.Router();
const {getAllSubscriptions,getSubscriptionById,createSubscription,updateSubscription,deleteSubscription} = require('../controllers/subscription');
const { requireSignin, authCheck} = require('../middlewares/auth');
const {authorize} = require("../middlewares/authorize");

router.get('/subscription', requireSignin, authCheck, authorize('read', 'Subscription'), getAllSubscriptions);
router.post('/subscription', requireSignin, authCheck, authorize('create', 'Subscription'), createSubscription);
router.get('/subscription/:id', requireSignin, authCheck, authorize('read', 'Subscription'), getSubscriptionById);
router.put('/subscription/:id', requireSignin, authCheck, authorize('update', 'Subscription'), updateSubscription);
router.delete('/subscription/:id', requireSignin, authCheck, authorize('delete', 'Subscription'), deleteSubscription);

module.exports = router;
