
const {} = require('dotenv/config')
const express = require("express");
const bodyParser = require('body-parser')
const morgan = require("morgan");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require('cors')
const fs = require('fs')
const controller = require("./controllers/dollar");
const compression = require('compression');
const path = require('path');
const { errorHandler } = require("./middlewares/errorHandler");

const app = express()
const intervalInMilliseconds = 40 * 60 * 1000;

setInterval(controller.chooseRandomFunction, intervalInMilliseconds);

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}
mongoose.set("strictQuery", false);

mongoose.connect(process.env.DATABASE_URL, options)
  .then((db) => {
    console.log("Database connection established");
    app.locals.db = db;
  })
  .catch((err) => {
    console.error("Error connecting to database", err);
    process.exit(1);
  });

//middleware
app.use(morgan('dev'))
app.use(cookieParser())
app.use(express.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({limit: "10mb", extended: true}));
app.use(cors())
app.use(compression());

// port
const port = process.env.PORT || 8000

// API routes
fs.readdirSync('./routes/').map(r => {
    return app.use('/api', require(`./routes/${r}`));
})

// Serve static files from the React app
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// Catch-all route handler
app.get('*', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  } else {
    res.status(404).send('Page not found');
  }
});

// Add error-handling middleware after the routes
app.use(errorHandler);

const server = app.listen(port, `0.0.0.0`, () => {
    setTimeout(() => {
        console.log(`Your backend REST api endpoint is at
           Local:            http://localhost:${port}/api
        `)
    }, 1000);
});

require('./modules/socket').init(server);
