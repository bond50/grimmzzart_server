// Import required models
const Route = require('../models/route');
const {CustomError} = require('../middlewares/errorHandler');
const Permission = require('mongoose').model('Permission');
// List routes
exports.listRoutes = async (req, res, next) => {
    try {
        const routes = await Route.find().populate('permissions');
        res.status(200).json(routes);
    } catch (error) {
        next(new CustomError(500, 'Internal server error'));

    }
};


// Create route
exports.createRoute = async (req, res, next) => {
    const {path, method, permissions} = req.body;

    try {
        const existingRoute = await Route.findOne({path, method});
        if (existingRoute) {
            return next(
                new CustomError(400, 'A route with the same path and method already exists.')
            );
        }

        // Ensure that all the provided permission ids are valid and exist in the database
        for (const permissionId of permissions) {
            const permissionExists = await Permission.findById(permissionId);
            if (!permissionExists) {
                return next(new CustomError(400, `Permission with id ${permissionId} does not exist.`));
            }
        }

        const route = new Route({path, method, permissions});
        const savedRoute = await route.save();
        res.status(201).json({
            message: 'Route created successfully.',
            route: savedRoute,
        });
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};


// Update route
exports.updateRoute = async (req, res) => {
    const {id} = req.params;
    const {path, permissions} = req.body;

    try {
        const route = await Route.findById(id);

        if (!route) {
            return res.status(404).json({message: 'Route not found'});
        }

        route.path = path;
        route.permissions = await Permission.insertMany(permissions);
        await route.save();

        res.status(200).json({message: 'Route updated', route});
    } catch (error) {
        res.status(500).json({message: 'Error updating route', error});
    }
};

// Delete route
exports.deleteRoute = async (req, res) => {
    const {id} = req.params;

    try {
        const route = await Route.findById(id).populate('permissions');

        if (!route) {
            return res.status(404).json({message: 'Route not found'});
        }

        await Permission.deleteMany({_id: {$in: route.permissions.map((perm) => perm._id)}});
        await route.delete();

        res.status(200).json({message: 'Route deleted'});
    } catch (error) {
        res.status(500).json({message: 'Error deleting route', error});
    }
};
