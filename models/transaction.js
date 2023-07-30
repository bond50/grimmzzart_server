const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema
const transactionSchema = new mongoose.Schema(
    {
        wallet: {
            type: ObjectId,
            ref: 'Wallet',
            required: true,
        },
        type: {
            type: String,
            enum: ['deposit', 'withdraw', 'transfer'],
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        from: {
            type: ObjectId,
            ref: 'Wallet',
        },
        to: {
            type: ObjectId,
            ref: 'Wallet',
        },
    },
    {timestamps: true}
)


module.exports = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

