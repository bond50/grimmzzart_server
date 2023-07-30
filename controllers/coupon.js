const Coupon = require("../models/coupon");


exports.create = async (req, res) => {
    try {
        const coupon = new Coupon(req.body);
        await coupon.save();
        res.status(201).send({coupon});
    } catch (error) {
        res.status(400).send({error: error.message});
    }

};

exports.list = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({createdAt: -1}).exec()
        res.send({coupons});
    } catch (error) {
        res.status(400).send({error: error.message});
    }

}

exports.getCoupon = async (req, res) => {

    try {
        const coupon = await Coupon.findById(req.params.couponId);
        if (!coupon) return res.status(404).send({error: "Coupon not found"});
        res.send({coupon});
    } catch (error) {
        res.status(400).send({error: error.message});
    }
};
exports.updateCoupon = async (req, res) => {

  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!coupon) return res.status(404).send({ error: "Coupon not found" });
    res.send({ coupon });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

exports.remove = async (req, res) => {
    try {
        res.json(await Coupon.findByIdAndDelete(req.params.couponId).exec())
    } catch (e) {
        res.status(400).send('Delete failed')
    }

};