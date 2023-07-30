const express = require('express')
const router = express.Router()
const {adminCheck, requireSignin, authCheck} = require('../middlewares/auth')
const {authorize} = require("../middlewares/authorize");


const {createTestimonial, getTestimonials} = require('../controllers/testimonial');


router.post('/testimonial', requireSignin, authCheck, adminCheck, authorize('create', 'Testimonial'), createTestimonial);
router.get('/testimonials', getTestimonials);

module.exports = router