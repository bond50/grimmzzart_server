const express = require('express');
const router = express.Router();
const {
    createFeedback,
    deleteFeedback,
    getAllFeedbacks,
    getFeedbackById,
    updateFeedback
} = require('../controllers/feedback');
const {requireSignin, authCheck} = require('../middlewares/auth');
const {authorize} = require("../middlewares/authorize");

router.get('/feedback', requireSignin, authCheck, authorize('read', 'Feedback'), getAllFeedbacks);
router.get('/feedback/:id', requireSignin, authCheck, authorize('read', 'Feedback'), getFeedbackById);
router.post('/feedback', requireSignin, authCheck, authorize('create', 'Feedback'), createFeedback);
router.put('/feedback/:id', requireSignin, authCheck, authorize('update', 'Feedback'), updateFeedback);
router.delete('/feedback/:id', requireSignin, authCheck, authorize('delete', 'Feedback'), deleteFeedback);

module.exports = router;
