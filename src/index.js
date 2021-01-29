const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");

//////////////////////////////////////////////////////////////////////////////////

const setupServer = async () => {
  // get the app config (MongoDB Atlas connection)
  const conf = require("../config.json");

  // setup Express
  let app = express();
  app.use(logger("dev"));

  // include body parser
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  // connect to MongoDB
  try {
    // avoid MongooseJS deprecation warnings
    mongoose.set("useNewUrlParser", true);
    mongoose.set("useFindAndModify", false);
    mongoose.set("useCreateIndex", true);
    mongoose.set("useUnifiedTopology", true);
    // connect to the DB server
    await mongoose.connect(conf.mongodb);
    console.log(`MongoDB connected: ${conf.mongodb}`);
  } catch (err) {
    console.log(err);
    process.exit(-1);
  }

  // import data models
  app.models = {
    Patient: require("./models/patient"),
  };

  // allow CORS
  app.use(cors());

  // import routes
  require("./api")(app);

  // Give the API overview
  app.get("*", (req, res) => {
    res.status(200).send("Welcome to the RFIV API.");
  });

  // run the server on specified port
  let server = app.listen(8080, () => {
    console.log(`RFIV listening on: ${server.address().port}`);
  });
};

//////////////////////////////////////////////////////////////////////////////////

// run the server
setupServer();
