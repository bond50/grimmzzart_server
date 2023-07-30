const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema

const feedbackSchema = new mongoose.Schema({
    user: {
        type: ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: ObjectId,
        ref: 'Product',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        maxlength: 500
    },
}, {timestamps: true});

const Feedback = mongoose.model('Feedback', feedbackSchema);
module.exports = Feedback;
