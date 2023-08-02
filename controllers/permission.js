const Permission = require('../models/permission');

const {CustomError} = require("../middlewares/errorHandler");


// List all permissions
exports.listPermissions = async (req, res, next) => {
    try {
        const permissions = await Permission.find({
            $and: [
                {action: {$ne: 'manage'}},
                {subject: {$ne: 'all'}},
            ],
        });
        res.status(200).json(permissions);
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

exports.listPermissionsWithPagination = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';

        const query = {
            $or: [
                {action: {$regex: search, $options: 'i'}},
                {subject: {$regex: search, $options: 'i'}},
                {description: {$regex: search, $options: 'i'}},
            ],
        };

        const permissions = await Permission.find(query)
            .skip((page - 1) * limit)
            .limit(limit);

        const totalCount = await Permission.countDocuments(query);

        res.status(200).json({data: permissions, totalCount, page, limit});
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};


// Create a new permission
exports.createPermission = async (req, res, next) => {
    try {
        const {name, resource, action, description} = req.body;
        const newPermission = new Permission({name, resource, action, description});
        const savedPermission = await newPermission.save();
        res.status(201).json(savedPermission);
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

// Update an existing permission
exports.updatePermission = async (req, res, next) => {
    try {
        const {id} = req.params;
        const {name, resource, action, description} = req.body;
        const updatedPermission = await Permission.findOneAndUpdate(
            {_id: id},
            {name, resource, action, description},
            {new: true}
        );
        res.status(200).json(updatedPermission);
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

// Delete a permission
exports.deletePermission = async (req, res, next) => {
    try {
        const {id} = req.params;
        const deletedPermission = await Permission.findOneAndDelete({_id: id});
        res.status(200).json(deletedPermission);
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

// Assign a role to a user
exports.assignRoleToUser = async (req, res, next) => {
    try {
        const {userId, roleId} = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {$addToSet: {roles: roleId}},
            {new: true}
        );
        res.status(200).json(updatedUser);
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

// Remove a role from a user
exports.removeRoleFromUser = async (req, res, next) => {
    try {
        const {userId, roleId} = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {$pull: {roles: roleId}},
            {new: true}
        );
        res.status(200).json(updatedUser);
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};
