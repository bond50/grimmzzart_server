const User = require('../models/user');
const Role = require('../models/role');
const {CustomError} = require('../middlewares/errorHandler');
const shortId = require("shortid");

exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find().select("username email firstName surname blocked suspended active");
        res.json(users);
    } catch (error) {
        next(error);
    }
};

exports.getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return next(new CustomError(404, 'User not found'));
        }
        res.json(user);
    } catch (error) {
        next(error);
    }
};


exports.createUser = async (req, res, next) => {
    let username = shortId.generate();
    let terms = true;

    try {
        const {password, role, idNo, drivingLicense, ...userData} = req.body;
        if (!password) {
            return next(new CustomError(400, 'Password is required'));
        }
        // Find the role's code from the Role model
        const foundRole = await Role.findById(role);
        if (!foundRole) {
            return next(new CustomError(400, 'Invalid role provided'));
        }

        // Check if the role code is 4000
        if (foundRole.code === 4000) {
            // Validate idNo and drivingLicense separately
            if (!idNo) {
                return next(new CustomError(400, 'ID Number must be provided for carrier role'));
            }

            if (!drivingLicense) {
                return next(new CustomError(400, 'Driving License Number must be provided for carrier role'));
            }
        }

        console.log('Password', userData)

        const newUser = new User({
            ...userData,
            role,
            idNo: foundRole.code === 4000 ? idNo : '',
            drivingLicense: foundRole.code === 4000 ? drivingLicense : '',
            terms: terms,
            username: username,
        });
        newUser._password = password; // Set the _password field directly
        await newUser.save();
        res.status(201).json({message: 'User added successfully'});
    } catch (error) {
        next(error);
    }
};



exports.updateUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.userId);
        console.log(JSON.stringify(user, null, 4))

        if (!user) return next(new CustomError(404, 'User not found'));

        // Check if user is trying to update their role
        if (req.body.role && req.body.role === user.role) {
            return next(new CustomError(403, 'Changing role is not allowed')
            )
        }

        await user.updateUser(req.body);
        res.json(user);

    } catch (error) {
        next(new CustomError(400, error.message));
    }
};

exports.deleteUser = async (req, res, next) => {
    try {
        // Find the user by ID and populate their role
        const user = await User.findById(req.params.userId).populate('role');


        // If the user is not found, throw an error
        if (!user) return next(new CustomError(404, 'User not found'));


        // If the user is trying to delete themselves and they have a role code of 1000, reject the action
        if (user._id.equals(req.user._id) && user.role.code === 1000) {
            return next(
                new CustomError(403, 'Admins cannot delete themselves'))
        }

        // Otherwise, delete the user
        await user.remove();
        res.json({message: 'User deleted successfully'});
    } catch (error) {
        next(new CustomError(400, error.message));
    }
};

