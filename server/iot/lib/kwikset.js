const { KwiksetHalo } = require("kwikset-halo");
const HaloLock = require("./kwikset-lock");

const KwiksetHaloModule = function (email, password) {
  let halo = undefined;

  this.init = async function () {
    if (halo) return true; // only need to initialize once
    const credentials = await KwiksetHalo.login(email, password);

    if (!credentials) {
      console.error("Error initializing Kwikset Halo");
      return false;
    }

    halo = new KwiksetHalo(credentials);

    return true;
  };

  this.getLock = async function (deviceId) {
    const status = await halo.getLockState(deviceId).catch((e) => {
      console.error("error ", e);
      throw e;
    });

    return new HaloLock(halo, deviceId, status);
  };
};

module.exports = KwiksetHaloModule;
