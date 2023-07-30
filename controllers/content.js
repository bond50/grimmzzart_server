const Content = require('../models/content');

exports.createContent = async (req, res) => {
    try {
        const content = new Content(req.body);
        await content.save();
        res.status(201).json({success: true, content});
    } catch (error) {
        res.status(400).json({success: false, error: error.message});
    }
};

exports.getContents = async (req, res) => {
    try {
        const contents = await Content.find().sort({createdAt: -1});
        res.status(200).json({success: true, contents});
    } catch (error) {
        res.status(400).json({success: false, error: error.message});
    }
};

exports.getContentByType = async (req, res) => {
    try {
        const contentType = req.params.type;
        const contents = await Content.find({type: contentType}).sort({createdAt: -1});
        res.status(200).json({success: true, contents});
    } catch (error) {
        res.status(400).json({success: false, error: error.message});
    }
};
