const tokens = {};

module.exports = {
    setAccessToken: function (token, userId, cartTotal, totalAfterDiscount, finalAmount) {
        tokens[userId] = {
            accessToken: token,
            cartTotal: cartTotal,
            totalAfterDiscount: totalAfterDiscount,
            payable:finalAmount
        };
    },
    getAccessToken: function (userId) {
        return tokens[userId];
    }
};