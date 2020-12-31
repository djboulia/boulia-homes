require("dotenv").config();

const Cloudant = require('@cloudant/cloudant');
const CloudantDB = require('./db/cloudantdb');
const FileDB = require('./db/filedb');
const Blink = require('node-blink-security');
const Nest = require('./iot/lib/nest');
const SmartThings = require('./iot/lib/smartthings');

const isProduction = function () {
    return false;
}

const config = {
    cloudant: {
        me: process.env.CLOUDANT_USERNAME,
        password: process.env.CLOUDANT_PASSWORD,
        db: process.env.CLOUDANT_DB
    },

    blink: {
        email: process.env.BLINK_EMAIL,
        password: process.env.BLINK_PASSWORD,
        app: process.env.BLINK_APP_NAME,
        device: process.env.BLINK_DEVICE_NAME,
    },

    nest: {
        clientId: process.env.NEST_CLIENT_ID,
        clientSecret: process.env.NEST_CLIENT_SECRET,
        refreshToken: process.env.NEST_REFRESH_TOKEN,
        projectId: process.env.NEST_PROJECT_ID,
    },

    smartthings: {
        accessToken: process.env.SMARTTHINGS_ACCESS_TOKEN
    },

    file: {
        path: process.env.TEST_DB_PATH
    },

    models: {
        'user': './models/users',
        'home': './models/homes',
    }
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

const DBLoader = function (modelName, modelPath) {
    const db = (isProduction()) ? cloudantDB(config.cloudant, modelName) : fileDB(config.file, modelName);
    const module = require(modelPath);
    return new module(db);
}

module.exports = {
    loadModel: function (modelName) {
        const modelPath = config.models[modelName];
        if (!modelPath) {
            throw 'Model ' + modelName + ' not found!';
        }

        return DBLoader(modelName, modelPath);
    },

    loadBlink: function () {
        const blink = new Blink(config.blink.email,
            config.blink.password,
            config.blink.app,
            {
                auth_2FA: true,
                device_name: config.blink.device
            });

        return blink;
    },

    loadNest: function () {
        const cfg = config.nest;

        const nest = new Nest(cfg.projectId,
            cfg.clientId,
            cfg.clientSecret,
            cfg.refreshToken
        );

        return nest;
    },

    loadSmartThings: function () {
        const cfg = config.smartthings;

        const system = new SmartThings(cfg.accessToken);

        return system;
    }

}


