const Dollar = require("../models/dollar");
const User = require("../models/user");
const Cart = require("../models/cart");
const {calculateCartTotalInDollar, calDisAmountAndFinalAmount} = require("../helpers/cart");

exports.calculateCartTotals = async (req, res, couponApplied) => {
    const dollar = await Dollar.findOne({});
    const user = await User.findById(req.auth._id).exec();
    const cart = await Cart.findOne({orderedBy: user._id}).exec();
    let {products, coupon, totalAfterDiscount} = cart;
    if (!totalAfterDiscount) {
        totalAfterDiscount = 0
    }
    const cartTotal = calculateCartTotalInDollar(products, dollar.rate);
    const {
        finalAmount,
        discountAmount,
    } = await calDisAmountAndFinalAmount(cartTotal, couponApplied, totalAfterDiscount, coupon);

    await Cart.updateOne({orderedBy: user._id}, {
        $set: {
            totalAfterDiscountUSD: totalAfterDiscount.toFixed(2),
            cartTotalUSD: cartTotal.toFixed(2),
            discountAmountUSD: discountAmount.toFixed(2),
            dollar,
            currencyCode: "USD",
        }
    }).exec();

    return {
        payable: finalAmount.toFixed(2),
        totalAfterDiscount: totalAfterDiscount.toFixed(2),
        discountAmount: discountAmount.toFixed(2),
        cartTotal: cartTotal.toFixed(2),
    };
};