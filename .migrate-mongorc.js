const path = require('path');
const configPath = path.join(__dirname, 'migrate-mongo-config.js');
module.exports = require(configPath);
