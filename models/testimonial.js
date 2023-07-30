const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema


const testimonialSchema = new mongoose.Schema({
    author: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },
    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
}, {timestamps: true});

module.exports = mongoose.model('Testimonial', testimonialSchema);
