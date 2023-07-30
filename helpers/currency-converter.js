const axios = require("axios");
const cheerio = require("cheerio");
const moment = require('moment');



const func1 = async () => {
    console.log('HERRRRR')
  try {
    const res1 = await axios.get(`https://www.xe.com/currencyconverter/convert/?Amount=1&From=USD&To=KES`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
        "Referer": "https://www.xe.com/currencyconverter/convert/?Amount=1&From=USD&To=KES",
        "Accept-Language": "en-US,en;q=0.8",
        "Accept-Encoding": "gzip, deflate, br"
      }
    });
    const $ = cheerio.load(res1.data);
    const rate = $("#__next > div:nth-child(2) > div.fluid-container__BaseFluidContainer-qoidzu-0.gJBOzk > section > div:nth-child(2) > div > main > div > div:nth-child(2) > div:nth-child(1) > div > p").text().trim();
    const [key, value] = rate.split('=');
    return value.trim().replace('USD', '');
  } catch (err) {
    console.error(err);
    return null;
  }
};

const func2 = () => {
    console.log("Function 2");
    return null;
};
const func3 = () => {
    console.log("Function 3");
    return null;
};
const func4 = () => {
    console.log("Function 4");
    return null;
};
const func5 = () => {
    console.log("Function 5");
    return 5;
};

const functions = [func1, func2, func3, func4, func5];
const selectedIndices = [];

exports.chooseRandomFunction = () => {
    let selectedFunction = null;
    let result = null;

    do {
        const randomIndex = Math.floor(Math.random() * functions.length);
        if (!selectedIndices.includes(randomIndex)) {
            selectedIndices.push(randomIndex);
            selectedFunction = functions[randomIndex];
            result = selectedFunction();
        }
    } while (!result && selectedIndices.length < functions.length);

    if (selectedIndices.length === functions.length) {
        selectedIndices.length = 0;
    }
};


