/**
 * hold all of our configuration data for this app
 */

const config = {
  cloudant: {
    me: process.env.CLOUDANT_USERNAME,
    password: process.env.CLOUDANT_PASSWORD,
    db: process.env.CLOUDANT_DB,
  },

  file: {
    path: process.env.TEST_DB_PATH,
  },

  models: {
    user: "./models/user",
    home: "./models/home",
  },

  blink: {
    credentialsFile: process.env.BLINK_CREDENTIALS_FILE,
  },

  nest: {
    clientId: process.env.NEST_CLIENT_ID,
    clientSecret: process.env.NEST_CLIENT_SECRET,
    refreshToken: process.env.NEST_REFRESH_TOKEN,
    projectId: process.env.NEST_PROJECT_ID,
  },

  smartthings: {
    accessToken: process.env.SMARTTHINGS_ACCESS_TOKEN,
  },

  meross: {
    email: process.env.MEROSS_EMAIL,
    password: process.env.MEROSS_PASSWORD,
  },

  flo: {
    email: process.env.FLO_EMAIL,
    password: process.env.FLO_PASSWORD,
  },

  kwiksethalo: {
    email: process.env.KWIKSET_HALO_EMAIL,
    password: process.env.KWIKSET_HALO_PASSWORD,
  },
};

module.exports = {
  getModel: function (modelName) {
    const modelPath = config.models[modelName];
    if (!modelPath) {
      throw "Model " + modelName + " not found!";
    }

    return modelPath;
  },

  getCloudant: function () {
    return config.cloudant;
  },

  getFile: function () {
    return config.file;
  },

  getBlink: function () {
    return config.blink;
  },

  getNest: function () {
    return config.nest;
  },

  getSmartThings: function () {
    return config.smartthings;
  },

  getMeross: function () {
    return config.meross;
  },

  getFlo: function () {
    return config.flo;
  },

  getKwiksetHalo: function () {
    return config.kwiksethalo;
  },
};
