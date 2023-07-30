const axios = require("axios");

exports.getOAuthToken = async (req, res, next) => {
    let consumer = process.env.SAFARICOM_CONSUMER_KEY;
    let secret = process.env.SAFARICOM_CONSUMER_SECRET;

    const auth = new Buffer.from(`${consumer}:${secret}`).toString("base64");

    await axios
        .get(
            "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
            {
                headers: {
                    authorization: `Basic ${auth}`,
                },
            }
        )
        .then((response) => {
            req.daraja = response.data;
            next();
        })
        .catch((err) => {
            console.log(err.message);
            res.status(400).json(err.message);
        });
};
