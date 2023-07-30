const Big = require('big.js');
const Cart = require("../models/cart");
const Coupon = require("../models/coupon");
const {convertPriceToDollar} = require("./priceToDollar");
const axios = require("axios");

function calculatePayableAmount(total, discount) {
    total = new Big(total);
    discount = new Big(discount);

    // Round the discount down to 2 decimal places
    discount = new Big(discount.toFixed(2));

    // Calculate the payable amount
    let payable = total.minus(discount);

    // Round the payable up to 2 decimal places
    payable = new Big(payable.toFixed(2));

    // Ensure that the total is always the sum of the discount and payable
    if (total.toFixed(2) !== discount.plus(payable).toFixed(2)) {
        const diff = total.minus(discount.plus(payable));
        payable = payable.plus(diff);
    }

    return payable.toFixed(2);
}
exports.calDisAmountAndFinalAmount = async (cartTotal, couponApplied, totalAfterDiscount, coupon) => {
    let finalAmount;
    let discountAmount;
    if (couponApplied && totalAfterDiscount && coupon) {
        const validCoupon = await Coupon.findById(coupon).exec();
        if (!validCoupon) {
            throw new Error("Invalid coupon code");
        }
        //cart total
        const cartTotalToBig = new Big(cartTotal);
        //discount amount from db
        const discount = new Big(validCoupon.discount);
        //convert discount to percentage
        const percentageDiscount = discount.div(100);
        //DiscountedPrice multiply by total
        const discountedTotal = cartTotalToBig.mul(percentageDiscount);
        //Final amount paid including discount
        finalAmount = calculatePayableAmount(cartTotal, discountedTotal);
        //actual discount charged
        discountAmount = discountedTotal.toFixed(2);
    } else {
        finalAmount = new Big(cartTotal).toFixed(2);
        discountAmount = new Big(0).toFixed(2);
    }

    return {
        finalAmount: Number(finalAmount),
        discountAmount: Number(discountAmount)
    };
}
exports.calculateCartTotalInDollar = (products, dollarRate) => {
    let cartTotal = new Big(0);
    for (let i = 0; i < products.length; i++) {
        const price = products[i].price
        if (price === undefined || !price) {
            cartTotal = cartTotal.plus(new Big(products[i].unit_amount.value).times(products[i].quantity))
        } else {
            const itemPrice = convertPriceToDollar(price, dollarRate).toFixed(2)
            cartTotal = cartTotal.plus(new Big(itemPrice).times(products[i].count))
        }
    }
    return Number(cartTotal.valueOf());
};
exports.getCartWithProductName = async (userId) => {
    return await Cart.findOne({orderedBy: userId})
        .populate('products.product')
        .exec();
}

exports.retrieveShippingAddress = (placeId) => {

    let shippingAddress = {};
    return axios.get(`https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&key=${process.env.GOOGLE_MAP_API_KEY}`)
        .then(response => {
            let result = response.data.result;
            console.log(response.data.result)
            shippingAddress = {
                recipient_name: result.name,
                line1: result.formatted_address,
                city: result.address_components[1].long_name,
                country_code: result.address_components[3].short_name,
                postal_code: result.address_components[6].long_name,
            };
            return {
                shippingAddress
            };
        });
};
