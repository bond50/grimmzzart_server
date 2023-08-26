const Category = require("../models/category");
const Brand = require("../models/brand");
const Sub = require("../models/sub");
const Product = require("../models/product");

exports.getSortedEntities = async (req, res) => {
    try {
        // Get sorted brands
        const sortedBrands = await Product.aggregate([
            {$group: {_id: '$brand', count: {$sum: 1}}},
            {$sort: {count: -1}},
        ]).exec();

        const brandDetails = await Brand.find({
            _id: {$in: sortedBrands.map((item) => item._id)},
        }).select('name slug');

        // Get sorted categories
        const sortedCategories = await Product.aggregate([
            {$group: {_id: '$category', count: {$sum: 1}}},
            {$sort: {count: -1}},
        ]).exec();

        const categoryDetails = await Category.find({
            _id: {$in: sortedCategories.map((item) => item._id)},
        }).select('name slug');

        // Get sorted subs
        const sortedSubs = await Product.aggregate([
            {$group: {_id: '$subs', count: {$sum: 1}}},
            {$sort: {count: -1}},
        ]).exec();

        const subDetails = await Sub.find({
            _id: {$in: sortedSubs.map((item) => item._id)},
        }).select('name slug');

        res.json({
            brands: brandDetails,
            categories: categoryDetails,
            subs: subDetails,
        });
    } catch (error) {
        res.status(500).json({error: 'Server error'});
    }
};
