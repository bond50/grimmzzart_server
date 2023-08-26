const Category = require('../models/category');
const Sub = require('../models/sub');
const Product = require('../models/product');
const slugify = require('slugify');
const NodeCache = require('node-cache');
const cache = new NodeCache();

const {errorHandler} = require('../helpers/dbErrorHandler');

exports.create = async (req, res) => {
    try {
        const {name, images} = req.body;
        const slug = slugify(name).toLowerCase();
        // Create a new category in the database
        const newCategory = await new Category({name, images, slug}).save();
        res.json(newCategory);
    } catch (err) {
        return res.status(400).json({
            error: errorHandler(err),
        });
    }
};

exports.list = async (req, res) => {


    try {
        res.json(await Category.find({}).sort({createdAt: -1}))
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({error: 'Internal server error'});
    }
};

exports.read = async (req, res) => {
    try {
        // Fetch the category from the database
        const category = await Category.findOne({slug: req.params.slug}).exec();
        const catId = category._id;

        // Fetch products associated with the category
        const products = await Product.find({category: catId})
            .populate('category')
            .populate('postedBy', '_id name')
            .exec();
        res.json({category, products});
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({error: 'Internal server error'});
    }
};

exports.update = async (req, res) => {
    const {name, images} = req.body;
    try {
        const updated = await Category.findOneAndUpdate(
            {slug: req.params.slug},
            {
                name,
                images,
                slug: slugify(name),
            },
            {new: true}
        );
        res.json(updated);
    } catch (e) {
        res.status(400).send('Category Update failed');
    }
};

exports.remove = async (req, res) => {
    try {
        const slug = req.params.slug.toLowerCase();

        // Fetch the category from the database
        const cat = await Category.findOne({slug}).exec();

        if (cat.subcategories.length > 0) {
            await Sub.deleteMany({_id: {$in: cat.subcategories}}).exec();
        }

        // Delete the category from the database
        const deleted = await Category.findOneAndDelete({slug});

        res.json(deleted);
    } catch (e) {
        res.status(400).send('Delete failed');
    }
};

exports.getSubs = async (req, res) => {
    const cacheKey = `subs:${req.params._id}`;

    // Check if subs data is in cache
    const cachedSubs = cache.get(cacheKey);
    if (cachedSubs) {
        return res.json(cachedSubs);
    }

    try {
        // Fetch subs data from your data source
        const subs = await Sub.find({parent: req.params._id}).exec();

        // Store subs data in cache for future requests
        cache.set(cacheKey, subs, 3600); // Cache for 1 hour

        res.json(subs);
    } catch (error) {
        console.error('Error fetching subs:', error);
        res.status(500).json({error: 'Internal server error'});
    }
};
