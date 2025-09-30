// we use the homebridge Flo package even though we're not using homebridge
// instead of loading the main module, we load the module that implements
// the core flo API
const Flo = require("homebridge-flobymoen/flomain");

const FloWaterValve = function (email, password) {
  const config = {
    auth: {
      username: email,
      password: password,
    },
  };

  const logger = {
    info: console.log,
    debug: console.debug,
    error: console.error,
  };

  const flo = new Flo(logger, config, undefined, console.debug);

  this.initComplete = false;

  this.init = async function () {
    const self = this;

    if (self.initComplete) {
      console.log("flo initialized previously");
      return true;
    }

    console.log("flo initialization starting");

    const initResult = await flo.init().catch((err) => {
      console.log("Error initializing flo: ", err);
      return false;
    });

    if (!initResult) {
      return false;
    }

    // only call discoverDevices() once... multiple
    // calls will continue adding to the flo_devices array
    const discoverResult = await flo.discoverDevices().catch((err) => {
      console.error("Error discovering flo devices", err);
      return false;
    });

    if (!discoverResult) {
      return false;
    }

    console.log("flo initialization complete");
    self.initComplete = true;
    return true;
  };

  this.uninit = async function () {
    // no uninit for this device, just return
    return;
  };

  /**
   * find the device structure required for the refreshDevice call
   * [4/30/2022] djb changed this method to return device index vs.
   *                 deviceid
   *
   * @param {string} id device id to find
   * @returns the index of the device in the device list
   */
  const findDevice = function (id) {
    for (let i = 0; i < flo.flo_devices.length; i++) {
      const device = flo.flo_devices[i];

      if (device.deviceid === id) {
        return i;
      }
    }

    return undefined;
  };

  this.isValveOpen = async function (id) {
    const index = findDevice(id);
    const device = index === undefined ? undefined : flo.flo_devices[index];

    if (index === undefined) {
      reject("device id " + id + " not found!");
      return;
    }

    console.log("flo device: ", device);

    const result = await flo.refreshDevice(index).catch((err) => {
      console.log("error: ", err);
      return undefined;
    });

    if (result === undefined) {
      return undefined; // could be offline, return undefined status
    }

    console.log("waterValve ", id);
    return device.valveCurrentState === "closed" ? false : true;
  };

  this.setValve = async function (id, open) {
    return flo.setValve(id, open ? "open" : "closed");
  };
};

module.exports = FloWaterValve;
