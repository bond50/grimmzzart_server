const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const routeSchema = new Schema({
    path: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
        enum: ['user', 'role', 'route', 'categoryRoute', 'sub'],
    },
    method: {
        type: String,
        required: true,
        enum: ['GET', 'POST', 'PUT', 'DELETE'],
    },
    permissions: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Permission',
        },
    ],
});

routeSchema.index({path: 1, method: 1}, {unique: true});

module.exports = mongoose.model('Route', routeSchema);

