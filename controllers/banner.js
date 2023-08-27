const Banner = require('../models/banner');
const Sub = require('../models/sub');
const Product = require('../models/product');
const Category = require('../models/category');
const Brand = require('../models/brand');


exports.create = async (req, res) => {
    const {contentType, contentId} = req.body;

    let contentExists = false;
    let slug = '';
    switch (contentType) {
        case 'Category':
            contentExists = await Category.findById(contentId);
            slug = contentExists ? contentExists.slug : '';
            break;
        case 'Sub':
            contentExists = await Sub.findById(contentId);
            slug = contentExists ? contentExists.slug : '';
            break;
        case 'Brand':
            contentExists = await Brand.findById(contentId);
            slug = contentExists ? contentExists.slug : '';
            break;
        case 'Product':
            contentExists = await Product.findById(contentId);
            slug = contentExists ? contentExists.slug : '';
            break;
        default:
            return res.status(400).json({error: 'Invalid content type'});
    }

    if (!contentExists) {
        return res.status(400).json({error: `${contentType} not found`});
    }

    // Automatically generate CTA link if not provided
    if (!req.body.ctaLink || req.body.ctaLink === '#') {
        req.body.ctaLink = `/${contentType.toLowerCase()}s/${slug}`;
    }

    try {
        const banner = await new Banner(req.body).save();
        res.json(banner);
    } catch (err) {
        res.status(400).json({error: err.message});
    }
};


exports.list = async (req, res) => {
    const banners = await Banner.find({});
    res.json(banners);
};

exports.read = async (req, res) => {
    const banner = await Banner.findOne({slug: req.params.slug});
    if (!banner) return res.status(400).json({error: 'Banner not found'});
    res.json(banner);
};

exports.update = async (req, res) => {
    const {slug} = req.params;
    const {contentType, contentId} = req.body;

    // Validate that the contentId exists for the given contentType
    let contentExists = false;
    switch (contentType) {
        case 'Category':
            contentExists = await Category.findById(contentId);
            break;
        case 'Sub':
            contentExists = await Sub.findById(contentId);
            break;
        case 'Brand':
            contentExists = await Brand.findById(contentId);
            break;
        case 'Product':
            contentExists = await Product.findById(contentId);
            break;
        default:
            return res.status(400).json({error: 'Invalid content type'});
    }

    if (!contentExists) {
        return res.status(400).json({error: `${contentType} not found`});
    }

    if (!req.body.ctaLink || req.body.ctaLink === '#') {
        const content = await eval(contentType).findById(contentId);
        req.body.ctaLink = `/${contentType.toLowerCase()}s/${content.slug}`;
    }

    try {
        const updated = await Banner.findOneAndUpdate({slug}, req.body, {new: true});
        res.json(updated);
    } catch (err) {
        res.status(400).json({error: err.message});
    }
};


exports.remove = async (req, res) => {
    try {
        const deleted = await Banner.findOneAndDelete({slug: req.params.slug});
        res.json(deleted);
    } catch (err) {
        res.status(400).json({error: err.message});
    }
};
