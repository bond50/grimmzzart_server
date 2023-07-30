const mongoose = require("mongoose");
const {ObjectId} = mongoose.Schema

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        uppercase: true,
        validate: function (value) {
            return /^[A-Za-z0-9]+$/.test(value);
        },
        unique: true
    },
    discount: {
        type: Number,
        required: true
    },
    expirationDate: {
        type: Date,
        required: true
    },
    usageLimit: {
        type: Number,
        default: 0
    },
    usageCount: {
        type: Number,
        default: 0
    },
    usedForPurchase: {
        type: Boolean,
        default: false
    },
    isValid: {
        type: Boolean,
        default: true
    },
    usedBy: [{
        type: ObjectId,
        ref: "User",
    }]
});

couponSchema.pre('save', async function (next) {
    const coupon = this;
    const now = new Date();
    if (coupon.expirationDate < now) {
        coupon.isValid = false;
        return next();
    }

    if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
        coupon.isValid = false;
        return next();
    }

    // // Check if coupon has already been used by the customer
    // if (coupon.usedBy.includes(customerId)) {
    //     coupon.isValid = false;
    //     return next();
    // }
    // const purchasedProduct = await Product.findById(purchasedProductId);
    // if (!coupon.validProducts.includes(purchasedProduct._id) && !coupon.validCategories.includes(purchasedProduct.category)) {
    //     coupon.isValid = false;
    //     return next();
    // }
    //
    // const customer = await User.findById(customerId);
    // if (coupon.firstTimeOnly && customer.orders.length > 0) {
    //     coupon.isValid = false;
    //     return next();
    // }
    //
    // if (!coupon.validLocations.includes(customerLocation)) {
    //     coupon.isValid = false;
    //     return next();
    // }

    next();
});

const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon;
