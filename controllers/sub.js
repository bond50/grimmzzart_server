const Sub = require('../models/sub');
const slugify = require('slugify');
const {errorHandler} = require('../helpers/dbErrorHandler');
const Product = require('../models/product');
const Category = require('../models/category');
const NodeCache = require('node-cache');
const cache = new NodeCache();
exports.read = async (req, res) => {
    // const cacheKey = `subcategory:${req.params.slug}`;
    //
    // // Check if subcategory data is in cache
    // const cachedSubcategory = cache.get(cacheKey);
    // if (cachedSubcategory) {
    //     return res.json(cachedSubcategory);
    // }

    try {
        const slug = req.params.slug.toLowerCase();
        const sub = await Sub.findOne({slug}).exec();

        const parent = await Category.findById(sub.parent);

        const products = await Product.find({subs: sub})
            .populate('category')
            .exec();

        // Create cache entry for the subcategory
        // cache.set(cacheKey, {sub, parent, products}, 3600); // Cache for 1 hour

        res.json({sub, parent, products});
    } catch (error) {
        console.error('Error fetching subcategory:', error);
        res.status(500).json({error: 'Internal server error'});
    }
};
exports.create = async (req, res) => {
    try {
        const {name, images, parent} = req.body;
        const slug = slugify(name).toLowerCase();

        const sub = await new Sub({name, images, parent, slug}).save();
        await Category.findByIdAndUpdate(parent, {$push: {subcategories: sub._id}}).exec();

        // Invalidate the cache by deleting the cached subcategories data
        // cache.del('subcategories');
        res.json(sub);
    } catch (err) {
        return res.status(400).json({
            error: errorHandler(err),
        });
    }
};

exports.list = async (req, res) => {
    // const cacheKey = 'subcategories';
    // // Check if subcategories data is in cache
    // const cachedSubcategories = cache.get(cacheKey);
    // if (cachedSubcategories) {
    //     return res.json(cachedSubcategories);
    // }

    try {
        // Fetch subcategories data from your data source
        const subcategories = await Sub.find({}).sort({createdAt: -1});

        // Store subcategories data in cache for future requests
        // cache.set(cacheKey, subcategories, 3600); // Cache for 1 hour

        res.json(subcategories);
    } catch (error) {
        console.error('Error fetching subcategories:', error);
        res.status(500).json({error: 'Internal server error'});
    }
};



exports.update = async (req, res) => {
    const {name, images, parent} = req.body;

    try {
        if (!parent) {
            const sub = await Sub.findOne({slug: req.params.slug}).exec();

            // Invalidate the cache by deleting the cached subcategory data
            // cache.del(`subcategory:${req.params.slug}`);
            // cache.del(`subcategories`);

        } else if (parent._id === undefined) {
            console.log('Changed parent', parent);
            const sub = await Sub.findOne({slug: req.params.slug}).exec();
            const subId = sub._id;
            console.log('subId 1', subId);

            const oldParentId = sub.parent;
            console.log(sub);
            console.log('oldId', oldParentId);

            const oldParentData = await Category.findById(oldParentId).exec();

            if (oldParentData && oldParentData.subcategories.includes(subId) === true) {
                await Category.updateOne({_id: oldParentId}, {$pull: {subcategories: subId}}, {new: true}).exec();
            }

            const updated = await Sub.findOneAndUpdate(
                {slug: req.params.slug},
                {
                    name,
                    images,
                    parent: parent,
                    slug: slugify(name),
                },
                {upsert: true}
            );

            await Category.findByIdAndUpdate(parent, {$push: {subcategories: subId}}).exec();

            // Invalidate the cache by deleting the cached subcategory data
            // cache.del(`subcategory:${req.params.slug}`);
            // cache.del(`subcategories`);

            res.json(updated);
        } else {
            console.log('Parent not changed');
            console.log(parent);
            const updated = await Sub.findOneAndUpdate(
                {slug: req.params.slug},
                {
                    name: name,
                    images,
                    slug: slugify(name),
                },
                {new: true}
            );

            // Invalidate the cache by deleting the cached subcategory data
            // cache.del(`subcategory:${req.params.slug}`);
            // cache.del(`subcategories`);

            res.json(updated);
        }
    } catch (e) {
        console.log(e);
        res.status(400).send('Update subcategory failed');
    }
};

exports.remove = async (req, res) => {
    try {
        const slug = req.params.slug.toLowerCase();
        const deleted = await Sub.findOneAndDelete({slug});

        // Invalidate the cache by deleting the cached subcategory data
        // cache.del(`subcategory:${req.params.slug}`);
        // cache.del(`subcategories`);

        res.json(deleted);
    } catch (e) {
        res.status(400).send('Delete failed');
    }
};
