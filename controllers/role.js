const {CustomError} = require("../middlewares/errorHandler");
const Role = require('../models/role')
const {ObjectId} = require("mongodb");
const {up, down} = require("../migrations/001_default_roles_permissions.js");
const User = require("../models/user");

// List all roles
exports.listRoles = async (req, res, next) => {
    try {
        const roles = await Role.find();
        res.status(200).json(roles);
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};


// Create a new role
exports.createRole = async (req, res, next) => {
    try {
        const {name, code, permissions} = req.body;
        const newRole = new Role({name, code, permissions});
        const savedRole = await newRole.save();
        res.status(201).json(savedRole);
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

// Update an existing role
exports.updateRole = async (req, res, next) => {
    try {
        const {id} = req.params;
        const {name, code, permissions} = req.body;

        // Check if the user is trying to update their own role
        if (req.user.role._id.toString() === id) {
            return res.status(403).json({message: "You cannot update your own role or permissions."});
        }

        const updatedRole = await Role.findByIdAndUpdate(
            id,
            {name, code, permissions},
            {new: true}
        );
        res.status(200).json(updatedRole);
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

// Delete a role
exports.deleteRole = async (req, res, next) => {
    try {
        const {id} = req.params;
        const roleToDelete = await Role.findById(id);
        if (!roleToDelete) {
            return res.status(404).json({message: 'Role not found'});
        }
        // Check if the role has code 1000, 2000, 3000, 4000, or 5000
        if ([1000, 2000, 3000, 4000, 5000].includes(roleToDelete.code)) {
            return res.status(403).json({message: 'You cannot delete this role'});
        }
        // Delete the role and any users associated with it
        await Role.findByIdAndDelete(id);
        await User.deleteMany({role: roleToDelete._id});
        res.status(200).json({message: 'Role and associated users deleted successfully'});
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};


// controllers/reset.js


exports.resetRolesAndPermissions = async (req, res, next) => {
    try {
        if (!req.app.locals.db) {
            throw new Error("Database connection not found.");
        }

        const db = req.app.locals.db.connection;

        // Step 1: Get all users with their roles before deleting the roles
        const users = await User.find().populate("role");
        console.log("Initial users:", users);

        // Step 2: Remove the existing roles and create new roles and permissions
        await down(db);
        await up(db);

        // Step 3: Reassociate the users with the newly created roles
        for (const user of users) {
            const newRole = await db.collection("roles").findOne({name: user.role.name});
            console.log(`New role for user ${user._id}:`, newRole);
            if (newRole) {
                await User.updateOne({_id: user._id}, {$set: {role: newRole._id}});
            }
        }

        // Log the updated users
        const updatedUsers = await User.find().populate("role");
        console.log("Updated users:", updatedUsers);

        res.status(200).json({message: "Roles and permissions have been reset to their default state."});
    } catch (error) {
        console.log(error);
        next(new CustomError(500, "An error occurred while resetting roles and permissions."));
    }
};

