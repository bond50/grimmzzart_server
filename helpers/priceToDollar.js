const Big = require("big.js");

exports.convertPriceToDollar = (price, dollarRate) => {
    if (!price || typeof price !== 'number' || price <= 0) {
        throw new Error("Invalid item price");
    }
    if (!dollarRate || typeof dollarRate !== 'number' || dollarRate <= 0) {
        throw new Error("Invalid dollar rate");
    }
    const rate = new Big(dollarRate);
    const itemPrice = new Big(price);
    return rate.mul(itemPrice).round(15).toNumber();
};

