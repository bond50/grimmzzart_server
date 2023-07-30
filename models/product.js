const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const powerRequirementsSchema = new mongoose.Schema({
    voltage: {
        type: String,
        trim: true,
    },
    amperage: {
        type: String,
        trim: true,
    },
    frequency: {
        type: String,
        trim: true,
    },
    power: {
        type: String,
        trim: true,
    },
    powerSupplyType: {
        type: String,
        trim: true,
    },
    plugType: {
        type: String,
        trim: true,
    },
    batteryRequirements: {
        type: String,
        trim: true,
    },
    powerManagementFeatures: {
        type: String,
        trim: true,
    },
});
const SpecificationSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,  // Make this field required
        maxlength: 100,  // Limit the maximum length of the name
    },
    value: {
        type: String,
        trim: true,
        required: true,  // Make this field required
        maxlength: 1000,  // Limit the maximum length of the value
    },
});

const dimensionsSchema = new mongoose.Schema({
    length: {
        type: String,

    },
    width: {
        type: String,

    },
    height: {
        type: String,

    },
    weight: {
        type: String,

    },
});
const cameraSchema = new mongoose.Schema({
    mainCamera: {
        resolution: {
            type: String,
            trim: true
        },
        features: {
            type: String,
            trim: true
        },
        aperture: {
            type: String,
            trim: true
        },
        sensorSize: {
            type: String,
            trim: true
        },
        pixelSize: {
            type: String,
            trim: true
        },
        focalLength: {
            type: String,
            trim: true
        },
        opticalZoom: {
            type: String,
            trim: true
        },
        videoResolution: {
            type: String,
            trim: true
        },
        flash: {
            type: String,
            trim: true
        },
        lens: {
            type: String,
            trim: true
        }
    },
    frontCamera: {
        resolution: {
            type: String,
            trim: true
        },
        features: {
            type: String,
            trim: true
        },
        aperture: {
            type: String,
            trim: true
        },
        sensorSize: {
            type: String,
            trim: true
        },
        pixelSize: {
            type: String,
            trim: true
        },
        focalLength: {
            type: String,
            trim: true
        },
        videoResolution: {
            type: String,
            trim: true
        },
        flash: {
            type: String,
            trim: true
        },
        lens: {
            type: String,
            trim: true
        }
    },
    sensors: {
        type: String,
        trim: true
    },
});

const ratingSchema = new mongoose.Schema({
    star: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    value: {
        type: String,
        required: true,
    },
    postedBy: {
        type: ObjectId,
        ref: 'User',
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});


const productSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            required: true,
            text: true,
            maxlength: 32,
        },
        displayTitle: {
            type: String,
            required: true,
        },
        sku: {
            type: String,
            trim: true,
            unique: true,
        },
        color: {
            type: String,
            trim: true,
        },
        video: {
            type: String,
            trim: true,
        },
        slug: {
            type: String,
            unique: true,
            index: true,
            lowercase: true,
        },
        description: {
            type: {},
            required: true,
            min: 200,
            max: 2000000

        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        brand: {
            type: ObjectId,
            ref: 'Brand',
        },
        price: {
            type: Number,
            required: true,
        },
        category: {
            type: ObjectId,
            ref: 'Category',
        },
        subs: [
            {
                type: ObjectId,
                ref: 'Sub',
            },
        ],
        quantity: {
            type: Number,
            min: 0,
            default: 0,
        },
        sold: {
            type: Number,
            min: 0,
            default: 0,
        },
        images: {
            type: Array,
        },
        shipping: {
            type: String,
            enum: ['Yes', 'No'],
            default: 'Yes'
        },
        postedBy: {
            type: ObjectId,
            ref: 'User',
        },
        status: {
            type: String,
            enum: ['Active', 'Out of Stock', 'Discontinued'],
            default: 'Active',
        },

        powerRequirements: powerRequirementsSchema,
        dimensions: dimensionsSchema,
        specifications: [SpecificationSchema],
        rating: [ratingSchema],
        warranty: {
            duration: {
                type: Number,
                default:0
            },
            details: {
                type: String,
            },
        },
    },
    {timestamps: true}
);


module.exports = mongoose.model('Product', productSchema);
