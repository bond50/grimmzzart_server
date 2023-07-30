const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema
const walletSchema = new mongoose.Schema(
    {
        user: {
            type: ObjectId,
            ref: 'User',
            required: true,
        },
        balance: {
            type: Number,
            default: 0,
        },
        transactions: [
            {
                type: ObjectId,
                ref: 'Transaction',
            },
        ],
    },
    {timestamps: true}
)


module.exports = mongoose.model('Wallet', walletSchema)
