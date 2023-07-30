// authorize.js
const {defineAbilitiesFor} = require('../helpers/abilities');
const {CustomError} = require('../middlewares/errorHandler');

function authorize(action, subject) {
    return async (req, res, next) => {
        const ability = await defineAbilitiesFor(req.user._id);
        if (ability.cannot(action, subject)) {
            return next(new CustomError(403, `You don't have rights to ${action} ${subject}.`));
        }
        next();
    };
}

module.exports = {authorize};