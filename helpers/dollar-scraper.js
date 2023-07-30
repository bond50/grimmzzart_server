const axios = require("axios");
const cheerio = require("cheerio");
const moment = require('moment');


exports.getConversionRate = async () => {

    // const res1 = await axios.get(`https://www.xe.com/currencyconverter/convert/?Amount=1&From=USD&To=KES`, {
    //     headers: {
    //         "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
    //         "Referer": "https://www.xe.com/currencyconverter/convert/?Amount=1&From=USD&To=KES",
    //         "Accept-Language": "en-US,en;q=0.8",
    //         "Accept-Encoding": "gzip, deflate, br"
    //     }
    // })
    //     .then(response => {
    //         const $ = cheerio.load(response.data);
    //
    //         const rate = $("#__next > div:nth-child(2) > div.fluid-container__BaseFluidContainer-qoidzu-0.gJBOzk > section > div:nth-child(2) > div > main > div > div:nth-child(2) > div:nth-child(1) > div > p").text().trim();
    //         const [key, value] = rate.split('=');
    //         return value.trim().replace('USD', '')
    //     })
    //     .catch(err => {
    //         console.error(err);
    //     });
    //
    //
    // const res2 = await axios.get("https://www.exchangerates.org.uk/Kenyan-Shillings-to-Dollars-currency-conversion-page.html", {
    //     headers: {
    //         "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
    //         "Referer": "https://www.exchangerates.org.uk/Kenyan-Shillings-to-Dollars-currency-conversion-page.html",
    //         "Accept-Language": "en-US,en;q=0.8",
    //         "Accept-Encoding": "gzip, deflate, br"
    //     }
    // }).then(res => {
    //     const html = res.data;
    //     const $ = cheerio.load(html);
    //     const rate = $(".p_conv30 span#shd2a").text();
    //     const [key, value] = rate.split('=');
    //     return value.trim().replace('USD', '')
    // }).catch(err => {
    //     console.error(err);
    // });

    // const response = await axios.get("https://wise.com/gb/currency-converter/kes-to-usd-rate", {
    //     headers: {
    //         "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
    //         "Referer": "https://wise.com/gb/currency-converter/kes-to-usd-rate",
    //         "Accept-Language": "en-US,en;q=0.8",
    //         "Accept-Encoding": "gzip, deflate, br"
    //
    //     }
    // }).then(res => {
    //     const html = res.data;
    //     const $ = cheerio.load(html);
    //     return $(".cc__source-to-target  span.text-success.d-inline-block").text();
    //
    //
    // }).catch(err => {
    //     console.error(err);
    // });
    // const res4 = await axios.get("https://www.currency.me.uk/convert/kes/usd", {
    //     headers: {
    //         "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
    //         "Referer": "https://www.currency.me.uk/convert/kes/usd",
    //         "Accept-Language": "en-US,en;q=0.8",
    //         "Accept-Encoding": "gzip, deflate, br"
    //
    //     }
    // }).then(res => {
    //
    //     const html = res.data;
    //     const $ = cheerio.load(html);
    //     const rate = $("#tofrom2a > span.mini.ccyrate > b").text();
    //     const [key, value] = rate.split('=');
    //     return value.trim().replace('USD', '')
    //
    // }).catch(err => {
    //     console.error(err);
    // });
    // const res5 = await axios.get("https://wise.com/gb/currency-converter/kes-to-usd-rate", {
    //     headers: {
    //         "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
    //         "Referer": "https://wise.com/gb/currency-converter/kes-to-usd-rate",
    //         "Accept-Language": "en-US,en;q=0.8",
    //         "Accept-Encoding": "gzip, deflate, br"
    //
    //     }
    // }).then(res => {
    //
    //     const html = res.data;
    //     const $ = cheerio.load(html);
    //     return $("#calculator > div.Calculator_ccCalculator___3ZLT > div.text-xs-center.text-lg-left > h3 > span.text-success.d-inline-block").text();
    //
    // }).catch(err => {
    //     console.error(err);
    // });

    // const res6 = await axios.get("https://www.forbes.com/advisor/money-transfer/currency-converter/usd-kes/", {
    //     headers: {
    //         "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
    //         "Referer": "https://www.forbes.com/advisor/money-transfer/currency-converter/usd-kes/",
    //         "Accept-Language": "en-US,en;q=0.8",
    //         "Accept-Encoding": "gzip, deflate, br"
    //
    //     }
    // }).then(res => {
    //
    //
    //     const html = res.data;
    //     const $ = cheerio.load(html);
    //     const rate = $("body > div > div.page.article-link-wrapper.inarticle-link-tracking.bg-white > div:nth-child(4) > div.section.section-calculator > div > div > div > div:nth-child(2)").text();
    //     const [key, value] = rate.split('=');
    //     return value.trim().replace('USD', '')
    //
    //
    // }).catch(err => {
    //     console.error(err);
    // });

    const res7 = await axios.get("https://www.bloomberg.com/quote/USDKES:CUR?leadSource=uverify%20wall", {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
            "Referer": "https://www.bloomberg.com/quote/USDKES:CUR?leadSource=uverify%20wall",
            "Accept-Language": "en-US,en;q=0.8",
            "Accept-Encoding": "gzip, deflate, br"

        }
    }).then(res => {


        const html = res.data;
        const $ = cheerio.load(html);
        const resp = $("#root > div > div > section > section.quotePageSnapshot > div > div.snapshot__ec6d7607a3.snapshot > section.snapshotOverview__21d98ae302.loading__da388f7220 > section > section > section > div:nth-child(1) > span.priceText__0550103750").text();
        return (1 / resp)


    }).catch(err => {
        console.error(err);
    });



};



