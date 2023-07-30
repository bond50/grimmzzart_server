const cloudinary = require('cloudinary')
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
exports.upload = async (req, res) => {

    let folder = "Ecommerce"
    if (req.body.folder) {
        folder = req.body.folder
    }


    let result = await cloudinary.v2.uploader.upload(req.body.image, {
        resource_type: "auto",
        public_id: `${Date.now()}`,
        folder: folder
    })
    res.json({
        public_id: result.public_id,
        url: result.secure_url

    })

}

exports.remove = (req, res) => {
    const imageId = req.body.public_id;
    cloudinary.uploader.destroy(imageId, (err, result) => {
        if (err) {
            return res.json({success: false, err});
        }
        res.send('ok');
    });
};
