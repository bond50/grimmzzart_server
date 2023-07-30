const crypto = require('crypto');

const virtuals = {
    password: {
        type: String,
        set: function (password) {
            // create a temporarity variable called _password
            this._password = password
            // generate salt
            this.salt = this.makeSalt()
            // encryptPassword
            this.hashed_password = this.encryptPassword(password)
        },
        get: function () {
            return this._password
        }
    }
}

virtuals.encryptPassword = function (password) {
    if (!password) return ''
    try {
        return crypto
            .createHmac('sha1', this.salt)
            .update(password)
            .digest('hex')
    } catch (err) {
        return ''
    }
}

virtuals.makeSalt = function () {
    return Math.round(new Date().valueOf() * Math.random()) + ''
}

module.exports = virtuals;
