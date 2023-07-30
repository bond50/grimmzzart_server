const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    name: {type: String, required: true},
    type: {type: String, required: true},
    duration: {type: Number, required: true},
    price: {type: Number, required: true},
    benefits: [String]
}, {timestamps: true});

const Subscription = mongoose.model('Subscription', subscriptionSchema);
module.exports = Subscription;
