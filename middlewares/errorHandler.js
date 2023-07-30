// src/middlewares/errorHandler.js

class CustomError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    let message = err.message;

    // Handle validation errors
    if (err.name === 'ValidationError') {
        const errorMessages = Object.values(err.errors).map(error => `${error.path} ${error.message.replace(/Path `.+`\s/, '')}`);
        message = errorMessages.length > 1 ? errorMessages : errorMessages[0];
    }

    // Handle duplicate key errors
    else if (err.code === 11000 && err.keyPattern) {
        const duplicateField = Object.keys(err.keyPattern)[0];
        message = `A record with the same ${duplicateField} already exists. Please use a different ${duplicateField}.`;
    }

    // Handle CastError (incorrect type or format for a value)
    else if (err.name === 'CastError') {
        message = `Invalid ${err.path}: ${err.value}.`;
    }

    // Handle missing or invalid tokens
    else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        message = 'Invalid or expired token.';
    }

    // Handle other errors
    else if (Array.isArray(message)) {
        message = message.map((e) => e.msg || e);
    } else if (typeof message === "object") {
        message = message.message || "Internal server error";
    }

    res.status(statusCode).json({message});
    next();
};


module.exports = {errorHandler, CustomError};
