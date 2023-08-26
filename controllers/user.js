const Product = require('../models/product')
const Cart = require('../models/cart')
const User = require("../models/user");
const Coupon = require("../models/coupon");
const Temp = require("../models/temp");
const Counter = require("../models/counter");
const ShortUniqueId = require('short-unique-id');
const sharedModule = require("../helpers/shared-safa-module");
const {formatPhoneNumber} = require("../helpers/phoneFormater");
const moment = require('moment');
const axios = require("axios");
const Order = require("../models/order");
const Dollar = require("../models/dollar");
const paypal = require("@paypal/checkout-server-sdk")
const socketIO = require("../modules/socket");
const Decimal = require('decimal.js');
const {
    calculateCartTotalInDollar,
    getCartWithProductName
} = require("../helpers/cart");

const {convertPriceToDollar} = require("../helpers/priceToDollar");
const {calculateCartTotals} = require("../helpers/calculateCartTotals");
const {response} = require("express");


const Environment =
    process.env.NODE_ENV === "production"
        ? paypal.core.LiveEnvironment
        : paypal.core.SandboxEnvironment

const paypalClient = new paypal.core.PayPalHttpClient(
    new Environment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
    )
)

exports.userCart = async (req, res) => {
    const {cart} = req.body
    let products = []
    const user = await User.findById(req.auth._id).exec()
    const cartExistsByThisUser = await Cart.findOne({orderedBy: user._id}).exec()
    if (cartExistsByThisUser) {
        await Cart.findOneAndRemove({orderedBy: user._id}).exec()
    }

    for (let i = 0; i < cart.length; i++) {
        let productsObject = {}
        productsObject.product = cart[i]._id
        productsObject.count = cart[i].count

        let p = await Product.findById(cart[i]._id).select('price').exec()
        products.push(productsObject)
        productsObject.price = p.price
    }
    //using reduce method
    const cartTotal = products.reduce((sum, i) => sum + (i.price * i.count), 0)
    const orderedBy = user._id
    const savedCart = await new Cart({products, cartTotal, cartTotalKES: cartTotal, orderedBy}).save()
    res.json({ok: true})
    console.log(JSON.stringify(savedCart, null, 4))

}
exports.getUserCart = async (req, res) => {
    const user = await User.findById(req.auth._id).exec()
    const cart = await Cart.findOne({orderedBy: user._id})
        .populate('products.product', '_id title price totalAfterDiscount')
        .exec()
    if (!cart) {
        return res.status(400).json({msg: 'No cart found'});
    }
    const {products, cartTotal, totalAfterDiscount} = cart
    res.json({products, cartTotal, totalAfterDiscount})


}
exports.emptyCart = async (req, res) => {
    const user = await User.findById(req.auth._id).exec()
    const cart = await Cart.findOneAndRemove({orderedBy: user._id}).exec()
    res.json(cart)


}
exports.saveAddress = async (req, res) => {
    const {place, address} = req.body;


    console.log(address)

    console.log(place)

    const {streetAddress, city, state, zipCode, country, name, lat, lng, googlePlaceId} = address;
    try {
        const newAddress = {
            streetAddress,
            city,
            place,
            state,
            zipCode,
            country,
            name,
            lat,
            lng,
            googlePlaceId
        };


        const userId = req.auth._id;

        const user = await User.findOne({_id: userId});
        if (!user) {
            return res.status(400).json({msg: 'User not found'});
        }

        let userAddresses = user.address;

        if (!userAddresses) {
            userAddresses = [];
        }

        let addressIndex = -1;
        userAddresses.forEach((address, index) => {
            if (googlePlaceId === address.googlePlaceId) {
                addressIndex = index;
            }
        });

        if (addressIndex === -1) {
            if (userAddresses.length >= 3) {
                userAddresses.shift();
            }
            userAddresses.push(newAddress);
        } else {
            userAddresses[addressIndex] = newAddress;
        }

        user.address = userAddresses;
        await user.save();

        const updatedUser = await User.findOne({_id: userId}).sort({updatedAt: -1}).exec();

        console.log(updatedUser.address)
        res.status(200).json({ok: true, address: updatedUser.address});

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};
exports.verifyTokenController = (req, res) => {
    res.sendStatus(200);
}


exports.orders = async (req, res) => {
    try {
        const user = await User.findById(req.auth._id).exec();
        const userOrders = await Order.find({orderedBy: user._id})
            .select('-coupon -conversionRate')
            .populate({
                path: 'products.product',
                populate: {
                    path: 'brand',
                    select: '_id name' // Fetch only brand name
                }
            }).sort('-createdAt')
            .exec();

        let orderArray = [];


        userOrders.map((order) => {
            let paymentStatus = null;

            if (order.paymentMethod === 'card') {
                paymentStatus = order.paymentIntentStripe.status;
            } else if (order.paymentMethod === 'paypal') {
                paymentStatus = order.paymentResponsePaypal.status;
            } else if (order.paymentMethod === 'mpesa' && order.paymentResponseMpesa.status === 'Success') {
                paymentStatus = order.paymentResponseMpesa.status;
            }

            if (paymentStatus !== null) {
                orderArray.push({
                    orderId: order.orderId,
                    _id: order._id,
                    products: order.products,
                    amount: order.totalAmountPaid,
                    shippingStatus: order.shippingStatus,
                    currencyCode: order.currencyCode,
                    shippingAddress: order.shippingAddress,
                    paymentMethod: order.paymentMethod,
                    paymentStatus: paymentStatus,
                    orderDate: order.orderDate,
                    orderStatus: order.orderStatus,
                });
            }
        });

        console.log(JSON.stringify(orderArray, null, 4));
        res.json(orderArray);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: 'Something went wrong'});
    }
};


exports.addToWishList = async (req, res) => {
    const {productId} = req.body
    await User.findByIdAndUpdate(req.auth._id, {$addToSet: {wishlist: productId}}).exec()
    res.json({ok: true})


}
exports.wishList = async (req, res) => {
    const list = await User.findById(req.auth._id).select('wishlist').populate('wishlist').exec()
    res.json(list)

}
exports.removeFromWishlist = async (req, res) => {
    const {productId} = req.params
    await User.findByIdAndUpdate(req.auth._id, {$pull: {wishlist: productId}}).exec()
    res.json({ok: true})
}
exports.applyCouponToUserCart = async (req, res) => {
    const {coupon, couponUsed} = req.body
    if (couponUsed === false) {
        const validCoupon = await Coupon.findOne({code: coupon}).exec()
        const user = await User.findById(req.auth._id).exec()
        // Check if the coupon exists in the database

        if (!validCoupon) return res.json({err: "Coupon not found"});

        // Check if the coupon has expired

        if (validCoupon.expirationDate < Date.now())
            return res.json({err: "Coupon has expired"});

        if (validCoupon.isValid === false)
            return res.json({err: "Coupon is not valid"});

        // const previousCoupon = await Coupon.findOne({usedBy: user._id});
        // if (previousCoupon) return res.json({err: "You can only use one coupon per purchase"});
        const cart = await Cart.findOne({orderedBy: user._id}).populate('products.product', '_id title price').exec()

        const {cartTotal} = cart

        //recalculate total after discount
        const discountedAmount = (cartTotal * (validCoupon.discount / 100)).toFixed(2)
        let totalAfterDiscount = (cartTotal - discountedAmount)
        await Cart.findOneAndUpdate({orderedBy: user._id}, {
            totalAfterDiscount,
            totalAfterDiscountKES: totalAfterDiscount,
            coupon: validCoupon._id
        }, {new: true}).exec()
        res.json({totalAfterDiscount, ok: true})
    }


}
exports.createMpesaOrder = async (req, res) => {
    const {
        MerchantRequestID,
        CheckoutRequestID,
        ResultCode,
        ResultDesc,
        CallbackMetadata,
    } = req.body.Body.stkCallback;

    const socketIOInstance = socketIO.getIO();
    const currentDate = new Date();


    try {
        const order = await updateOrder({
            MerchantRequestID,
            CheckoutRequestID,
            ResultCode,
            ResultDesc,
            CallbackMetadata,
            currentDate,
        });

        console.log(req.body.Body.stkCallback)

        if (order) {
            if (ResultCode !== 0 && !CallbackMetadata) {
                console.error(`STK Push request failed with ResultCode: ${ResultCode}, ResultDesc: ${ResultDesc}`);
                const responseToClient = {ResultDesc, ResultCode};
                socketIOInstance.emit("mpesaPaymentFailed", responseToClient);
                return res.status(200).json(responseToClient);

            } else {
                await updateProducts({products: order.products});
                await updateCoupon({coupon: order.coupon, orderedBy: order.orderedBy});

                const userData = await getUserData({
                    orderedBy: order.orderedBy,
                    ResultDesc: ResultDesc,
                    CallbackMetadata: order.paymentResponseMpesa.CallbackMetadata
                });

                const finalResult = {result: userData, saved: order};
                socketIOInstance.emit("mpesaPaymentSuccess", finalResult);

                const response = {ResultCode: 0, ResultDesc: "Success"};
                res.status(200).json(response);
            }
        } else {
            console.log("Order not found");
            return res.status(404).json({error: "Order not found"});
        }
    } catch (error) {
        console.log("Error updating order:", error);
        return res.status(500).json({error: "Error updating order"});
    }
};

const updateOrder = async ({
                               MerchantRequestID,
                               CheckoutRequestID,
                               ResultCode,
                               ResultDesc,
                               CallbackMetadata,
                               currentDate
                           }) => {
    const filter = {
        "paymentResponseMpesa.MerchantRequestID": MerchantRequestID,
        "paymentResponseMpesa.CheckoutRequestID": CheckoutRequestID,
    };
    const update = {
        $set: {
            "paymentResponseMpesa.status": ResultCode === 0 && CallbackMetadata ? "Success" : "failed",
            "paymentResponseMpesa.ResultCode": ResultCode,
            "paymentResponseMpesa.ResultDesc": ResultDesc,
            "paymentResponseMpesa.CallbackMetadata": CallbackMetadata,
            deliveryStartDate: ResultCode === 0 && CallbackMetadata ? new Date(currentDate.getTime() + 5 * 24 * 60 * 60 * 1000) : null,
            deliveryEndDate: ResultCode === 0 && CallbackMetadata ? new Date(currentDate.getTime() + 10 * 24 * 60 * 60 * 1000) : null,
            totalAmountPaid: ResultCode === 0 && CallbackMetadata ? getItemValue("Amount", CallbackMetadata) : null,
            orderStatus: "Pending",
        },
    };
    const options = {new: true};
    return Order.findOneAndUpdate(filter, update, options);
};

const updateProducts = async ({products}) => {
    const bulkOption = products.map((item) => {
        return {
            updateOne: {
                filter: {_id: item.product._id},
                update: {$inc: {quantity: -item.count, sold: item.count}},
            },
        };
    });
    await Product.bulkWrite(bulkOption, {new: true});
};

const updateCoupon = async ({coupon, orderedBy}) => {
    if (coupon) {
        const validCoupon = await Coupon.findById(coupon).exec();
        validCoupon.usedForPurchase = true;
        validCoupon.usageCount += 1;
        validCoupon.usedBy.push(orderedBy);
        await validCoupon.save();
    }
};

const getUserData = async ({orderedBy, CallbackMetadata}) => {
    const user = await User.findById(orderedBy).exec();
    return {
        name: `${user.firstName} ${user.middleName} ${user.surname}`,
        email: user.email,
        transactionId: getItemValue("MpesaReceiptNumber", CallbackMetadata),
        transactionDate: getItemValue("TransactionDate", CallbackMetadata),
        transactionAmount: getItemValue("Amount", CallbackMetadata),
    };
};

const getItemValue = (itemName, metadata) => {
    const item = metadata.Item.find((item) => item.Name === itemName);
    return item ? item.Value : null;
};


exports.initiateMpesaOrder = async (req, res) => {
    const socketIOInstance = socketIO.getIO();
    const {selectedPaymentMethod, couponApplied, phoneNumber, shippingAddress,} = req.body;
    const timestamp = moment().format('YYYYMMDDHHmmss');
    const user = await User.findById(req.auth._id).exec();
    const cart = await Cart.findOne({orderedBy: user._id}).exec();
    const {products, coupon, totalAfterDiscount, discountAmount, cartTotal} = cart;
    let finalAmount
    if (couponApplied && totalAfterDiscount) {
        finalAmount = totalAfterDiscount
    } else {
        finalAmount = cartTotal
    }

    const shortCode = process.env.SAFARICOM_SHORT_CODE;
    const passkey = process.env.SAFARICOM_PASS_KEY;
    const url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
    const phone = `254${phoneNumber}`
    const password = new Buffer.from(shortCode + passkey + timestamp).toString("base64");
    const data = {
        BusinessShortCode: process.env.SAFARICOM_SHORT_CODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: 1,
        PartyA: phone,
        PartyB: process.env.SAFARICOM_SHORT_CODE,
        PhoneNumber: phone,
        CallBackURL: "https://fc0b-197-254-56-194.ngrok-free.app/api/mpesa/callback",
        AccountReference: 'Grimz Mart',
        TransactionDesc: "TPayment of Online goods",
    };

    try {
        const result = await axios.post(url, data,
            {
                headers:
                    {
                        authorization: `Bearer ${req.daraja.access_token}`
                    }
            })
        const now = new Date()
        const deliveryStartDate = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000)
        const deliveryEndDate = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
        await new Order({
            products,
            paymentResponseMpesa: {...result.data, status: 'Pending'},
            orderedBy: user._id,
            paymentMethod: selectedPaymentMethod.toLowerCase(),
            shippingAddress,
            coupon,
            deliveryEndDate,
            totalAmountPaid: 0,
            deliveryStartDate,
            cartTotal,
            discountAmount
        }).save()

        const CustomerMessage = result.data.CustomerMessage


        socketIOInstance.emit("mpesaInit", CustomerMessage);


        res.json({ok: true, CustomerMessage})

    } catch (error) {
        console.log('Error occured', error);

        let errorMessage = '';

        if (error.response) {
            console.error(error.response.data);
            console.error(error.response.status);
            console.error(error.response.headers);
            errorMessage = error.response.data;
            res.status(error.response.status).json({error: errorMessage});
        } else if (error.request) {
            console.error(error.request);
            errorMessage = 'Error in request';
            res.status(500).json({error: errorMessage});
        } else {
            console.error('Error', error.message);
            errorMessage = error.message;
            res.status(500).json({error: errorMessage});
        }
        console.error(error.config);
    }

}
exports.initiatePayPal = async (req, res) => {

    const {couponApplied} = req.body;
    console.log(req.body)
    const totals = await calculateCartTotals(req, res, couponApplied);
    let {payable, discountAmount} = totals

    try {
        const user = await User.findById(req.auth._id).exec();
        const populatedCart = await getCartWithProductName(user._id);
        const {products} = populatedCart
        const dollar = await Dollar.findOne({});

        const items = products.map(item => {
            return {
                name: item.product.title || "Item",
                unit_amount: {
                    currency_code: "USD",
                    value: convertPriceToDollar(item.price, dollar.rate).toFixed(2),
                },
                quantity: item.count,
            };
        });
        let itemTotal = calculateCartTotalInDollar(items, dollar.rate).toFixed(2);

        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        request.requestBody({
            intent: "CAPTURE",
            application_context: {
                brand_name: process.env.APP_NAME,
            },
            purchase_units: [
                {
                    reference_id: user._id,
                    description: `payment for ${process.env.APP_NAME}`,
                    soft_descriptor: `${process.env.APP_NAME}`,

                    amount: {
                        currency_code: "USD",
                        value: payable,
                        breakdown: {
                            item_total: {
                                currency_code: "USD",
                                value: itemTotal,
                            },
                            discount: {
                                currency_code: "USD",
                                value: discountAmount,
                            }
                        },
                    },
                    items,
                },
            ]
        });
        const order = await paypalClient.execute(request)
        res.json({id: order.result.id})

    } catch (e) {
        res.status(500).json({error: e.message})
        console.error(e.message)
    }
}
exports.getMpesaDetails = async (req, res) => {
    const request = require('request');
    const consumerKey = process.env.SAFARICOM_CONSUMER_KEY;
    const consumerSecret = process.env.SAFARICOM_CONSUMER_SECRET;
    const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    const transactionId = 'ws_CO_17022023064425754708374149';
    const shortcode = process.env.SAFARICOM_SHORT_CODE;
    const url = `https://api.safaricom.co.ke/mpesa/transactionstatus/v1/query?transactionID=${transactionId}&shortCode=${shortcode}&passkey=${process.env.SAFARICOM_PASS_KEY}`;
    console.log(req.daraja.access_token)
    const options = {
        url: url,
        headers: {
            authorization: `Bearer ${req.daraja.access_token}`
        }
    };

    request.get(options, (error, response, body) => {
        if (error) {
            console.error(error);

        } else {
            const data = JSON.parse(body);
            res.json(data)
            console.log(data);
        }
    });


}
exports.createStripeOrder = async (req, res) => {
    const {
        shippingAddress,
        paymentIntent,
        couponApplied,
        selectedPaymentMethod
    } = req.body;
    try {
        const user = await User.findById(req.auth._id).exec();
        const cart = await Cart.findOne({orderedBy: user._id}).exec();
        const {products, coupon, dollar, currencyCode, cartTotal, discountAmount} = cart;
        const now = new Date()
        const deliveryStartDate = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000)
        const deliveryEndDate = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);

        const newOrder = await new Order({
            products,
            paymentIntentStripe: paymentIntent,
            orderedBy: user._id,
            paymentMethod: selectedPaymentMethod.toLowerCase(),
            shippingAddress,
            totalAmountPaid: paymentIntent.amount / 100,
            deliveryEndDate,
            currencyCode,
            conversionRate: dollar,
            deliveryStartDate,
            coupon,
            cartTotal,
            discountAmount
        }).save();
        const bulkOption = products.map((item) => {
            return {
                updateOne: {
                    filter: {_id: item.product._id},
                    update: {$inc: {quantity: -item.count, sold: item.count}},
                },
            };
        });
        await Product.bulkWrite(bulkOption, {new: true});
        if (coupon) {
            const validCoupon = await Coupon.findById(coupon).exec();
            validCoupon.usedForPurchase = true;
            validCoupon.usageCount += 1;
            validCoupon.usedBy.push(user._id);
            await validCoupon.save();
        }
        console.log('USER', user)

        const data = {
            name: `${user.firstName} ${user.middleName} ${user.surname}`,
            email: user.email,
            transactionId: paymentIntent.id,
            transactionDate: paymentIntent.created * 1000,
            transactionAmount: paymentIntent.amount / 100
        }

        res.json({result: data, saved: newOrder});

    } catch (err) {
        // Handle any errors from the call
        console.error(err);
        return res.send(500);
    }


}
exports.capturePayPalPaymentAndSavePaypalOrder = async (req, res) => {
    const {orderId, selectedPaymentMethod, shippingAddress} = req.body;

    console.log(req.body)

    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});
    try {
        const user = await User.findById(req.auth._id).exec();
        const cart = await Cart.findOne({orderedBy: user._id}).exec();
        const {products, coupon, dollar, currencyCode, cartTotalUSD, discountAmountUSD} = cart;
        const capture = await paypalClient.execute(request);
        const result = capture.result;
        //SAVE ORDER TO DB
        if (result) {
            const now = new Date()
            const deliveryStartDate = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000)
            const deliveryEndDate = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
            const newOrder = await new Order({
                products,
                paymentResponsePaypal: result,
                orderedBy: user._id,
                paymentMethod: selectedPaymentMethod.toLowerCase(),
                shippingAddress,
                totalAmountPaid: result.purchase_units[0].payments.captures[0].amount.value,
                deliveryEndDate,
                currencyCode,
                conversionRate: dollar,
                deliveryStartDate,
                coupon,
                cartTotal: cartTotalUSD,
                discountAmount: discountAmountUSD
            }).save();


            // Decrement quantity, increment sold
            const bulkOption = products.map((item) => {
                return {
                    updateOne: {
                        filter: {_id: item.product._id},
                        update: {$inc: {quantity: -item.count, sold: item.count}},
                    },
                };
            });
            await Product.bulkWrite(bulkOption, {new: true});
            if (coupon) {
                const validCoupon = await Coupon.findById(coupon).exec();
                validCoupon.usedForPurchase = true;
                validCoupon.usageCount += 1;
                validCoupon.usedBy.push(user._id);
                await validCoupon.save();
            }
            res.json({result, saved: newOrder});
        }
        // return capture.result;
    } catch (err) {
        // Handle any errors from the call
        console.error(err);
        return res.send(500);
    }

}



