/**
 * Load our data models for the homes app.  This module will provide
 * different backends for hosting the data.  In testing mode, we can
 * use a simple file based data store.  In production we use a full
 * database.
 */

const Cloudant = require("@cloudant/cloudant");
const CloudantDB = require("./db/cloudantdb");
const FileDB = require("@apiserver/db-file");
const DbModel = require("@apiserver/model-db");
const Model = require("@apiserver/model");
const User = require("./models/user");
const Home = require("./models/home");
const Garage = require("./models/garage");
const Thermostat = require("./models/thermostat");
const Lock = require("./models/lock");

const isProduction = function () {
  return false;
};

let cloudant = undefined;

const cloudantDB = function (config, modelName) {
  if (!cloudant) {
    cloudant = Cloudant({ account: config.me, password: config.password });
  }

  return new CloudantDB(cloudant, config.db, modelName);
};

const fileDB = function (config, modelName) {
  return new FileDB(config.path, modelName);
};

const DBLoader = function (modelName, config) {
  const modelPath = config.getModel(modelName);
  if (!modelPath) {
    throw "Model " + modelName + " not found!";
  }

  const db = isProduction()
    ? cloudantDB(config.getCloudant(), modelName)
    : fileDB(config.getFile(), modelName);
  return db;
};

module.exports = {
  addModels: function (config, app) {
    app.addModel(new DbModel(DBLoader("user", config), "user"), User);
    app.addModel(new DbModel(DBLoader("home", config), "home"), Home);
    app.addModel(new Model("garage"), Garage);
    app.addModel(new Model("thermostat"), Thermostat);
    app.addModel(new Model("lock"), Lock);
  },

  getUser: function (app) {
    return app.getModel("user");
  },
};
