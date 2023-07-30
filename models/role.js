const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const {ObjectId} = mongoose.Schema
const roleSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    code: {
        required: true,
        type: Number,
        unique: true
    },
    active: {
        type: Boolean,
        default: true,
    },
    permissions: [
        {
            type: ObjectId,
            ref: 'Permission',
        },
    ],
});

module.exports = mongoose.model('Role', roleSchema);
