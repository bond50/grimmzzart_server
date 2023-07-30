const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const permissionSchema = new Schema({
    action: {
        type: String,
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    own: {
        type: Boolean,
        default: false,
    },
    fields: {
        type: [String],
        default: [],
    },
    conditions: {
        type: String,
        default: {},
    },
    description: {
        type: String,
        default: '',
    },
    invert: {
        type: Boolean,
        default: false,
    },
});

permissionSchema.index({action: 1, subject: 1}, {unique: true});

module.exports = mongoose.model("Permission", permissionSchema);
