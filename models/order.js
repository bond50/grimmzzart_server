const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema
const Counter = require('./counter')
const {accessibleRecordsPlugin} = require('@casl/mongoose');

const OrderSchema = new mongoose.Schema(
    {
        products: [
            {
                product: {
                    type: ObjectId,
                    ref: 'Product',
                    required: true,
                },
                count: {
                    type: Number,
                    required: true
                }

            }
        ],
        paymentIntentStripe: {},
        paymentResponsePaypal: {},
        paymentResponseMpesa: {},
        discountAmount: Number,
        orderStatus: {
            type: String,
            enum: [
                "Pending", // Order received but not yet processed.
                "Confirmed", // Order has been confirmed by the seller.
                "Processing", // Order is being prepared for shipment.
                "Awaiting Payment Confirmation", // Waiting for M-Pesa payment confirmation.
                "Paid", // Payment has been received (could be via M-Pesa, card, or other methods).
                "Shipped", // Order has been shipped.
                "In Transit", // Order is on its way to the customer.
                "Out for Delivery", // The delivery person has the order and is on the way to the customer's location.
                "Delivered", // Order has been delivered to the customer.
                "Failed Delivery", // Delivery attempt was made but failed.
                "Returned", // Customer returned the product.
                "Refunded", // Money has been returned to the customer.
                "Cancelled", // Order was cancelled by the customer or seller.
                "Warranty Claim", // Customer has claimed warranty for the product.
                "Service/Repair", // Product is under service or repair.
                "Replacement Sent" // A replacement product has been sent to the customer.
            ],
            default: "Pending"
        },

        orderedBy: {
            type: ObjectId,
            ref: 'User',
            required: true
        },
        orderId: {
            type: String,
            unique: true
        },
        orderDate: {
            type: Date,
            default: Date.now
        },
        currencyCode: {
            type: String,
            default: 'KES'
        },
        paymentMethod: {
            type: String,
            required: true
        },
        shippingAddress: {
            type: Object,
            required: true
        },
        totalAmountPaid: {
            type: Number,
            required: true
        },
        shippingStatus: {type: String, default: "Not Shipped"},
        deliveryStartDate: {
            type: Date,
            required: true
        },
        deliveryEndDate: {
            type: Date,
            required: true
        },
        conversionRate: {},
        coupon: {
            type: ObjectId,
            ref: "Coupon",
        }
    },
    {timestamps: true}
)

OrderSchema.pre("save", async function (next) {
    const order = this;
// Find and increment the "orderIdCounter"
    const counter = await Counter.findOneAndUpdate({name: "orderIdCounter"}, {$inc: {count: 1}}, {
        new: true,
        upsert: true
    });
// Assign the incremented value to the "orderId" field
    order.orderId = `ORD-${counter.count.toString().padStart(8, "0")}`;
    order.products.forEach((product) => {
        if (!product.product || !product.count) {
            const error = new Error('Invalid product data');
            return next(error);
        }
    });
    next();

});

OrderSchema.index({orderId: 1});
OrderSchema.index({orderStatus: 1});
OrderSchema.index({orderedBy: 1});

OrderSchema.post("save", function (doc) {
    console.log("A new order was created:", doc);
});

OrderSchema.plugin(accessibleRecordsPlugin);
const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;




