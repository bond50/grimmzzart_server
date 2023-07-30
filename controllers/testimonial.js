const Testimonial = require('../models/Testimonial');

exports.createTestimonial = async (req, res) => {
    try {
        const testimonial = new Testimonial(req.body);
        await testimonial.save();
        res.status(201).json({success: true, testimonial});
    } catch (error) {
        res.status(400).json({success: false, error: error.message});
    }
};

exports.getTestimonials = async (req, res) => {
    try {
        const testimonials = await Testimonial.find().sort({createdAt: -1});
        res.status(200).json({success: true, testimonials});
    } catch (error) {
        res.status(400).json({success: false, error: error.message});
    }
};
