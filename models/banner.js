const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const BannerSchema = new mongoose.Schema({
    contentType: {
        type: String,
        enum: ['Category', 'Sub', 'Brand', 'Product'],
        required: true,
    },
    contentId: {
        type: ObjectId,
        required: true,
    },
    ctaText: {
        type: String,
        default: "Shop Now"
    },
    ctaLink: {
        type: String,
        default: "#"
    },
    isActive: {
        type: Boolean,
        default: true
    },
    startDate: {
        type: Date,
    },
    endDate: {
        type: Date,
    },
    images: {
        type: Array,
    },
    title: {
        type: String,
        required: true,
    },
    subtitle: {
        type: String,
        required: true,
    },
    price: {
        type: String,
        required: true,
    },
    isMainBanner: {
        type: Boolean,
        default: false,
    },
    isSmallBanner: {
        type: Boolean,
        default: false,
    },
}, {timestamps: true});

BannerSchema.index({ contentType: 1, contentId: 1, title: 1, subtitle: 1 }, { unique: true });
BannerSchema.pre('save', function (next) {
    // 1. Set isActive to false if endDate has reached
    if (this.endDate && new Date(this.endDate) <= new Date()) {
        this.isActive = false;
    }

    next();
});

// If you want to apply the same logic during updates, you can add another middleware for 'updateOne'
BannerSchema.pre('updateOne', function (next) {
    const update = this.getUpdate();

    // 1. Set isActive to false if endDate has reached
    if (update.endDate && new Date(update.endDate) <= new Date()) {
        update.isActive = false;
    }
    next();
});

module.exports = mongoose.model('Banner', BannerSchema);
