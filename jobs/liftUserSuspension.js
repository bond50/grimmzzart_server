const mongoose = require('mongoose');
const User = require('../models/user');

const liftUserSuspension = async (job) => {
    console.log("liftUserSuspension job started");
    const {userId} = job.attrs.data;
    console.log(`Searching for user with id: ${userId}`); // Add this line
    const user = await User.findById(userId);

    if (user && user.suspended) {
        console.log(`User ${user.username} is suspended. Lifting suspension.`); // Add this line
        user.suspended = false;
        user.active = true;
        user.blocked = false;
        user.suspensionStart = null;
        user.suspensionEnd = null;

        await user.save();
        console.log(`Suspension lifted for user ${user.username}`);
    } else {
        console.log(`User not found or not suspended. User: ${user}`); // Add this line
    }
};


module.exports = liftUserSuspension;
