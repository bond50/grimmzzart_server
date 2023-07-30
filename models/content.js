const mongoose = require("mongoose");
const contentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000,
    },
    type: {
        type: String,
        enum: ['event', 'educational', 'successStory', 'sustainability'],
        required: true,
    },
    startDate: {
        type: Date,
    },
    endDate: {
        type: Date,
    },
    image: {
        type: String,
    },
    link: {
        type: String,
    },
}, {timestamps: true});
module.exports = mongoose.model('Content', contentSchema);
