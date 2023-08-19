const Brand = require('../models/brand');
const slugify = require('slugify');
const { errorHandler } = require('../helpers/dbErrorHandler');
const NodeCache = require('node-cache');
const cache = new NodeCache();

exports.create = async (req, res) => {
    try {
        const {name, logo, description, website} = req.body;
        const slug = slugify(name).toLowerCase();
        const newBrand = await new Brand({name, slug, logo, description, website}).save();
        res.json(newBrand);
    } catch (err) {
        return res.status(400).json({
            error: errorHandler(err),
        });
    }
};

exports.list = async (req, res) => {
    try {
        const brands = await Brand.find({}).exec();


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
        res.json(removedBrand);
    } catch (err) {
        return res.status(400).json({
            error: errorHandler(err),
        });
    }
};
