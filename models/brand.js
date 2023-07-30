const mongoose = require('mongoose');

const BrandSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        text: true,
        maxlength: 32,
    },
    slug: {
        type: String,
        unique: true,
        index: true,
        lowercase: true
    },
    logo: {
        type: String,
    },
    description: {
        type: String,
    },
    website: {
        type: String,
    },
});

module.exports = mongoose.model('Brand', BrandSchema);
