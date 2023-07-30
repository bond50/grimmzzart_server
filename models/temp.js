const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema

const tempSchema = new mongoose.Schema(
    {
        requestedBy: {
            type: ObjectId,
            ref: 'User'
        },
        accessToken: {
            type: String
        },
        cartTotal: {
            type: String
        },
        totalAfterDiscount: {
            type: String
        },
        payable: {
            type: String
        },

    },
    {timestamps: true}
)


module.exports = mongoose.model('Temp', tempSchema)
