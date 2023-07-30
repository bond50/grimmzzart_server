const mongoose = require('mongoose')
const crypto = require('crypto')
const {ObjectId} = mongoose.Schema
const dolarSchema = new mongoose.Schema({
        rate: {
            type: Number,
            required: true
        },
        from: {
            type: String,
        }
    },
    {timestamps: true}
)


module.exports = mongoose.model('Dollar', dolarSchema)
