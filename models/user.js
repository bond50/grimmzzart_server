const mongoose = require('mongoose');
const {hashPassword} = require('../utils/password-utils');
const bcrypt = require('bcrypt');

async function checkUnique(field, value) {
    if (value) {
        const user = await this.constructor.findOne({[field]: value});
        if (user && String(user._id) !== String(this._id)) {
            return false;
        }
    }
    return true;
}

const {ObjectId} = mongoose.Schema;
const addressSchema = new mongoose.Schema(
    {

        place: {},
        city: {
            type: String,
        },

        state: {
            type: String,
        },
        region: {
            type: String,
        },
        postalAddress: {
            type: String,
        },

        formattedAddress: {
            type: String,
        },

        zipCode: {
            type: String,
        },

        country: {
            type: String,
        },
        lat: {
            type: Number,
            required: true,
        },

        lng: {
            type: Number,
            required: true,
        },
        name: {
            type: String,
        },
        firstName: {
            type: String,
        },
        surname: {
            type: String,
        },

        phoneNumber: {
            type: String,
            trim: true,
            unique: true,
            validate: {
                validator: function (v) {
                    return /^(?:\+254|0)[17]\d{8}$/.test(v);
                },
                message: '{VALUE} is not a valid  phone number!',
            },
            required: [true, 'User phone number required']
        },

        googlePlaceId: {
            type: String,
            required: true,
        },
    },
    {timestamps: true}
);

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            trim: true,
            required: true,
            max: 32,
            unique: true,
            index: true,
            lowercase: true,
        },

        subscription: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subscription',
            default: null,
        },
        phoneNumber: {
            type: String,
            trim: true,
            unique: true,
            validate: {
                validator: function (v) {
                    return /^(?:\+254|0)[17]\d{8}$/.test(v);
                },
                message: '{VALUE} is not a valid  phone number!',
            },
            required: [true, 'User phone number required']
        },
        firstName: {
            type: String,
            trim: true,
            required: true,
            max: 32,
        },
        middleName: {
            type: String,
            trim: true,
            max: 32,
        },
        surname: {
            type: String,
            trim: true,
            required: true,
            max: 32,
        },
        location: String,
        email: {
            type: String,
            trim: true,
            unique: true,
            index: true,
            required: true,
            lowercase: true,
        },
        hasLoggedInBefore: {
            type: Boolean,
            default: false
        },
        is2FAEnabled: {
            type: Boolean,
            default: false
        },
        secret: String,
        role: {
            type: ObjectId,
            ref: 'Role',
            required: true,
        },

        dob: {
            type: Date,
        },
        terms: {
            type: Boolean,
            required: true,
            default: false,
        },

        gender: {
            type: String,
            enum: ['male', 'female', 'intersex', 'undisclosed'],
        },
        blocked: {
            type: Boolean,
            default: false,
        },
        suspended: {
            type: Boolean,
            default: false,
        },
        active: {
            type: Boolean,
            default: true,
        },

        cart: {
            type: Array,
            default: [],
        },

        address: [addressSchema],

        wishlist: [{type: ObjectId, ref: 'Product'}],

        hashed_password: {
            type: String,
            required: true,
        },
        salt: String,
        suspensionCount: {
            type: Number,
            default: 0,
        },
        suspensionStart: {
            type: Date,
            default: null,
        },
        suspensionEnd: {
            type: Date,
            default: null,
        },
        forcePasswordChange: {
            type: Boolean,
            default: false
        },

        suspensionPeriod: {
            type: Number,
            default: null,
        },

        about: {
            type: String,
        },
        resetPasswordLink: {
            type: String,
            default: '',
        },
    },
    {timestamps: true}
);

userSchema.pre('validate', async function (next) {
    // Hash the password if it's a new or modified password
    if ((this.isNew || this.isModified('_password')) && this._password) {
        this.hashed_password = await hashPassword(this._password);
    }

    next();
});

userSchema.methods = {
    authenticate: async function (plainText) {
        return await bcrypt.compare(plainText, this.hashed_password);
    },
    updateUser: async function (updateData) {
        // Update user fields
        Object.assign(this, updateData);

        // Check for updates to active, blocked, and suspended fields
        if (this.active) {
            this.setActive();
        } else if (this.blocked) {
            await this.setBlocked();
        } else if (this.suspended) {
            this.active = false;
            this.blocked = false;
            this.suspended = true;
            this.suspensionCount++;
            const suspensionEndTime = new Date(
                Date.now() + this.suspensionPeriod
            );
            this.suspensionStart = new Date();
            this.suspensionEnd = suspensionEndTime;
            if (this.suspensionCount >= 3) {
                await this.setBlocked();
            }
        }

        // Reset the suspension count if it's set to 0
        if (
            updateData.hasOwnProperty('suspensionCount') &&
            updateData.suspensionCount === 0
        ) {
            this.suspensionCount = 0;
        }

        await this.save();
    },

    setActive: function () {
        this.active = true;
        this.blocked = false;
        this.suspended = false;
    },
    setBlocked: async function () {
        this.active = false;
        this.blocked = true;
        this.suspended = false;
        this.suspensionCount = 0;
        await this.save();
    },
    reactivateIfSuspended: async function () {
        if (
            this.suspended &&
            this.suspensionEnd &&
            new Date(this.suspensionEnd) < new Date()
        ) {
            this.setActive();
            await this.save();
        }
    },
};
const User = mongoose.model('User', userSchema);

module.exports = User;
