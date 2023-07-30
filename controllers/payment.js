const Product = require('../models/product')
const Cart = require('../models/cart')
const User = require("../models/user");
const Coupon = require("../models/coupon");
const axios = require('axios').default;
const stripe = require('stripe')(process.env.STRIPE_SECRET)
const paypal = require('paypal-rest-sdk');
const Dollar = require("../models/dollar");
const socketIO = require("../modules/socket");
const {calculateCartTotalInDollar, calDisAmountAndFinalAmount} = require("../helpers/cart");
const {calculateCartTotals} = require("../helpers/calculateCartTotals");


exports.createPaymentIntent = async (req, res) => {
    const {couponApplied, selectedPaymentMethod} = req.body;
    if (selectedPaymentMethod === 'Mpesa') {
        try {
            const user = await User.findById(req.auth._id).exec()
            const cart = await Cart.findOne({orderedBy: user._id}).exec()
            const {cartTotal, totalAfterDiscount} = cart
            let finalAmount
            if (couponApplied && totalAfterDiscount) {
                finalAmount = totalAfterDiscount
            } else {
                finalAmount = cartTotal
            }
            res.send({
                totalAfterDiscount:totalAfterDiscount.toFixed(2),
                payable: finalAmount.toFixed(2),
                cartTotal:cartTotal.toFixed(2),
                discountAmount: cartTotal-totalAfterDiscount.toFixed(2)

            })

        } catch (e) {
            console.log(e)
        }

    } else {
        try {
            const totals = await calculateCartTotals(req, res, couponApplied);
            let {payable, discountAmount, totalAfterDiscount, cartTotal} = totals
            const convertAmountToCents = (amount) => {
                return Math.round(amount * 100);
            };
            let paymentIntent
            let stripeClientSecret
            let paypalClientSecret
            if (selectedPaymentMethod === 'Card') {
                payable = convertAmountToCents(payable);
                try {
                    paymentIntent = await stripe.paymentIntents.create({
                        amount: payable,
                        currency: 'USD',
                        payment_method: 'pm_card_visa',
                    })
                    stripeClientSecret = paymentIntent.client_secret
                } catch (e) {
                    console.log(e)
                }

            }
            if (selectedPaymentMethod === 'Card') {
                payable = payable / 100;
            }

            if (selectedPaymentMethod === 'Paypal') {
                paypalClientSecret = process.env.PAYPAL_CLIENT_ID;

            }

            res.send({
                stripeClientSecret,
                paypalClientSecret,
                cartTotal,
                totalAfterDiscount,
                discountAmount,
                payable,
            })
        } catch (e) {
            console.log(e)
        }
    }
};


exports.lipaNaMpesaOnlineCallback = async = (req, res) => {
    const io = socketIO.getIO();
    const transactionDetails = req.body
    // const {
    //     ResultCode,
    //     ResultDesc,
    //     CheckoutRequestID,
    //     MerchantRequestID,
    //     CallbackMetadata
    // } = transactionDetails.stkCallback

    console.log(transactionDetails)


    // if (!CallbackMetadata) {
    //     io.emit('failedMpesa', ResultDesc);
    // }
    //
    // if (CallbackMetadata) {
    //     io.emit('succeedMpesa', ResultDesc);
    //     // const phone = CallbackMetadata.Item[4].Value
    //     // const amount = CallbackMetadata.Item[0].Value
    //     // const transactionCode = CallbackMetadata.Item[1].Value
    //
    //
    // }

    return res.json('ok')


}


