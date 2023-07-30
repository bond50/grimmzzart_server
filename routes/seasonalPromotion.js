const express = require('express')
const router = express.Router()
const {adminCheck, requireSignin, authCheck} = require('../middlewares/auth')
const {authorize} = require("../middlewares/authorize");
const { createSeasonalPromotion, getSeasonalPromotions } = require('../controllers/seasonalPromotion');

router.post('/seasonal-promotion', requireSignin, authCheck, adminCheck, authorize('create', 'SeasonalPromotion'), createSeasonalPromotion);
router.get('/seasonal-promotions', getSeasonalPromotions);

module.exports = router