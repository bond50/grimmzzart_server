const Brand = require('../models/brand');
const slugify = require('slugify');
const { errorHandler } = require('../helpers/dbErrorHandler');
const NodeCache = require('node-cache');
const cache = new NodeCache();

exports.create = async (req, res) => {
    try {
        const {name, logo, description, website} = req.body;
        const slug = slugify(name).toLowerCase();

        // Create a new brand in the database
        const newBrand = await new Brand({name, slug, logo, description, website}).save();

        // Invalidate the cache by deleting the cached brands data
        cache.del('brands');

        res.json(newBrand);
    } catch (err) {
        return res.status(400).json({
            error: errorHandler(err),
        });
    }
};

exports.list = async (req, res) => {
    // Try getting data from cache
    const cacheBrands = cache.get('brands');

    if (cacheBrands) {
        return res.json(cacheBrands);
    }

    try {
        const brands = await Brand.find({}).exec();

        // Store data in cache
        cache.set('brands', brands);

        res.json(brands);
    } catch (err) {
        return res.status(400).json({
            error: errorHandler(err),
        });
    }
};

exports.read = async (req, res) => {
    try {
        const brand = await Brand.findOne({slug: req.params.slug}).exec();
        res.json(brand);
    } catch (err) {
        return res.status(400).json({
            error: errorHandler(err),
        });
    }
};

exports.update = async (req, res) => {
    try {
        const {name, logo, description, website} = req.body;
        const updatedBrand = await Brand.findOneAndUpdate(
            {slug: req.params.slug},
            {name, logo, description, website},
            {new: true}
        );

        // Invalidate the cache by deleting the cached brands data
        cache.del('brands');

        res.json(updatedBrand);
    } catch (err) {
        return res.status(400).json({
            error: errorHandler(err),
        });
    }
};


exports.remove = async (req, res) => {
    try {
        const removedBrand = await Brand.findOneAndDelete({slug: req.params.slug});

        // Invalidate the cache by deleting the cached brands data
        cache.del('brands');

        res.json(removedBrand);
    } catch (err) {
        return res.status(400).json({
            error: errorHandler(err),
        });
    }
};
