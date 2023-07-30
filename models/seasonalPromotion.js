const mongoose = require("mongoose");
const {ObjectId} = mongoose.Schema

const seasonalPromotionSchema = new mongoose.Schema({
    product: {
        type: ObjectId,
        required: true,
        ref: 'Product'
    },

    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    bannerImage: {
        type: String,
    },
}, {timestamps: true});
module.exports = mongoose.model('SeasonalPromotion', seasonalPromotionSchema);
