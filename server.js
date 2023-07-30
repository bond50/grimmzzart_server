const express = require("express");
const bodyParser = require('body-parser')
const morgan = require("morgan");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const {} = require('dotenv/config')
const cors = require('cors')
const fs = require('fs')
const controller = require("./controllers/dollar");
const compression = require('compression');
const path = require('path');



const { errorHandler } = require("./middlewares/errorHandler");
const app = express()
const intervalInMilliseconds = 40 * 60 * 1000;
// const intervalInMilliseconds = 10000;


setInterval(controller.chooseRandomFunction, intervalInMilliseconds);


const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}
mongoose.set("strictQuery", false);

mongoose.connect(process.env.DATABASE_URL, options)
  .then((db) => {
    console.log("Database connection established");

    // Set the db variable as a local variable on the app object
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
app.use(express.static(path.join(__dirname, '..', 'client', 'build')));

app.use(compression());


// port
const port = process.env.PORT || 8000


fs.readdirSync('./routes/').map(r => {
    return app.use('/api', require(`./routes/${r}`));
})

process.on('uncaughtException', function (exception) {
    console.log(exception); // to see your exception details in the console
    // if you are on production, maybe you can send the exception details to your
    // email as well ?
});


// Add error-handling middleware after the routes
app.use(errorHandler);
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
// });
const server = app.listen(port, `0.0.0.0`, () => {
    setTimeout(() => {
        console.log(`Your backend REST api endpoint is at
           Local:            http://localhost:${port}/api
        `)
    }, 1000);

});


require('./modules/socket').init(server);
