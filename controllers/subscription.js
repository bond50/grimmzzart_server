const Subscription = require('../models/subscription');

const getAllSubscriptions = async (req, res) => {
    try {
        const subscriptions = await Subscription.find({});
        res.status(200).json(subscriptions);
    } catch (error) {
        res.status(500).json({error: 'Error fetching subscriptions'});
    }
};

const getSubscriptionById = async (req, res) => {
    try {
        const subscription = await Subscription.findById(req.params.id);
        if (subscription) {
            res.status(200).json(subscription);
        } else {
            res.status(404).json({error: 'Subscription not found'});
        }
    } catch (error) {
        res.status(500).json({error: 'Error fetching subscription'});
    }
};

const createSubscription = async (req, res) => {
    try {
        const newSubscription = new Subscription(req.body);
        await newSubscription.save();
        res.status(201).json(newSubscription);
    } catch (error) {
        res.status(500).json({error: 'Error creating subscription'});
    }
};

const updateSubscription = async (req, res) => {
    try {
        const updatedSubscription = await Subscription.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (updatedSubscription) {
            res.status(200).json(updatedSubscription);
        } else {
            res.status(404).json({error: 'Subscription not found'});
        }
    } catch (error) {
        res.status(500).json({error: 'Error updating subscription'});
    }
};

const deleteSubscription = async (req, res) => {
    try {
        const deletedSubscription = await Subscription.findByIdAndRemove(req.params.id);
        if (deletedSubscription) {
            res.status(200).json({message: 'Subscription deleted successfully'});
        } else {
            res.status(404).json({error: 'Subscription not found'});
        }
    } catch (error) {
        res.status(500).json({error: 'Error deleting subscription'});
    }
};

module.exports = {
    getAllSubscriptions,
    getSubscriptionById,
    createSubscription,
    updateSubscription,
    deleteSubscription
};
