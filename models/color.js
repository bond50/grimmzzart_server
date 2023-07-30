const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const colorSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true
    },

}, {timestamps: true});

module.exports = mongoose.model('Color', colorSchema);
