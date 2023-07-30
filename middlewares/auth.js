const User = require('../models/user');
const jwt = require('jsonwebtoken');
const {CustomError} = require("../middlewares/errorHandler");

const extractToken = (req) => {
    const authHeader = req.headers['authorization'];
    return authHeader && authHeader.split(' ')[1];
};

const verifyAndDecodeToken = (token) => {


    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {


            if (err) {
                reject(new CustomError(401, 'Invalid or expired token.'));
            } else if (decodedToken.exp * 1000 < Date.now()) {
                reject(new CustomError(401, 'Token has expired.'));
            }
            resolve(decodedToken);
        });
    });
};


exports.adminCheck = async (req, res, next) => {
    const user = req.user;
        console.log(user)
    if (user.role.code !== 1000) {
        return next(new CustomError(403, `Access Denied.`));
    }
    next();
};

exports.authCheck = (req, res, next) => {
    const authUserId = req.auth._id;


    User.findById({_id: authUserId})
        .populate('role') // Populate the 'role' field
        .exec((err, user) => {
            if (err || !user) {
                return next(new CustomError(400, 'User not found'));
            }
            req.user = user;

            next();
        });
};

exports.requireSignin = async (req, res, next) => {
    const token = extractToken(req);


    if (!token) {
        return next(new CustomError(401, 'Unauthorized access. Please provide a valid authentication token.'));
    }

    try {
        req.auth = await verifyAndDecodeToken(token);
        next();
    } catch (error) {
        next(error);
    }
};
