const SeasonalPromotion = require('../models/seasonalPromotion');

exports.createSeasonalPromotion = async (req, res) => {
    try {
        const seasonalPromotion = new SeasonalPromotion(req.body);
        await seasonalPromotion.save();
        res.status(201).json({ success: true, seasonalPromotion });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.getSeasonalPromotions = async (req, res) => {
    try {
        const seasonalPromotions = await SeasonalPromotion.find().sort({ startDate: -1 });
        res.status(200).json({ success: true, seasonalPromotions });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
