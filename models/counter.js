const mongoose = require("mongoose");


const counterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    count: {
        type: Number,
        default: 0
    }
}, {timestamps: true})

const Coupon = mongoose.model("Counter", counterSchema);

module.exports = Coupon;