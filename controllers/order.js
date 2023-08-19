const Order = require('../models/order')

exports.listOrders = async (req, res) => {
    try {
        const {status, orderId} = req.query;

        console.log('KENYOY', req.query);

        let filter = {};
        if (status) {
            filter.orderStatus = status;
        }
        if (orderId) {
            filter.orderId = new RegExp(orderId, 'i');
        }

        const orders = await Order.find(filter).populate('orderedBy', '_id email').exec();
        res.json(orders);
    } catch (error) {
        res.status(500).json({error: "Failed to fetch orders"});
    }
};


exports.getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('orderedBy', '_id username').exec();
        if (!order) return res.status(404).json({error: "Order not found"});
        res.json(order);
    } catch (error) {
        res.status(500).json({error: "Failed to fetch the order"});
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, {orderStatus: req.body.status}, {new: true}).exec();
        if (!order) return res.status(404).json({error: "Order not found"});
        res.json(order);
    } catch (error) {
        res.status(500).json({error: "Failed to update the order"});
    }
};

exports.getTotalOrders = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments(); // This will count all documents in the Order collection
        res.json({totalOrders});
    } catch (error) {
        res.status(500).json({error: "Failed to fetch total orders"});
    }
};


exports.getTotalAmount = async (req, res) => {
    try {
        const totalAmount = await Order.aggregate([
            {
                $project: {
                    totalInKES: {
                        $cond: [
                            {$eq: ["$currencyCode", "USD"]},
                            {$multiply: ["$totalAmountPaid", {$divide: [1, {$ifNull: ["$conversionRate.rate", 1]}]}]},
                            "$totalAmountPaid"
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: {$sum: "$totalInKES"}
                }
            }
        ]);

        console.log('TOTAL', totalAmount[0].totalAmount);
        res.json(totalAmount[0].totalAmount);
    } catch (err) {
        res.status(500).send("Server Error");
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id).exec();
        if (!order) return res.status(404).json({error: "Order not found"});
        res.json({message: "Order deleted successfully"});
    } catch (error) {
        res.status(500).json({error: "Failed to delete the order"});
    }
};
