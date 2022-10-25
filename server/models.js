/**
 * Load our data models for the homes app.  This module will provide
 * different backends for hosting the data.  In testing mode, we can
 * use a simple file based data store.  In production we use a full
 * database.
 */

const Cloudant = require('@cloudant/cloudant');
const CloudantDB = require('./db/cloudantdb');
const FileDB = require('@apiserver/db-file');

const isProduction = function () {
    return false;
}

let cloudant = undefined;

const cloudantDB = function (config, modelName) {
    if (!cloudant) {
        cloudant = Cloudant({ account: config.me, password: config.password });
    }

    return new CloudantDB(cloudant, config.db, modelName);
}

const fileDB = function (config, modelName) {
    return new FileDB(config.path, modelName);
}

const DBLoader = function (modelName, config) {    
    const modelPath = config.getModel(modelName);
    if (!modelPath) {
        throw 'Model ' + modelName + ' not found!';
    }

    const db = (isProduction()) ? cloudantDB(config.getCloudant(), modelName) : fileDB(config.getFile(), modelName);
    const module = require(modelPath);
    return new module(db);
}

module.exports = {
    getUsers : function (config) {
        return DBLoader('user', config);
    },

    getHomes : function (config) {
        return DBLoader('home', config);
    }
}


