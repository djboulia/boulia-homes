const Camera = function (blink) {
  let blinkModule = undefined;

  /**
   * initialize or refresh the camera info
   */
  this.init = async function () {
    const module = await blink.init().catch((e) => {
      console.log("Blink setup error: ", e);
      throw e;
    });

    blinkModule = module;

    console.log("setting up blink library");
    await blinkModule.setupSystem();
  };

  this.updateSystem = async function (systems) {
    const self = this;

    const promises = [];
    for (let j = 0; j < systems.length; j++) {
      const device = systems[j];
      console.log("updateSystem ", device);

      promises.push(self.systemStatus(device));
    }

    const results = await Promise.all(promises).catch((e) => {
      console.error("Error updating camera systems: ", e);
      throw e;
    });

    for (let j = 0; j < results.length; j++) {
      const device = systems[j];
      const status = results[j];
      device.status = status;

      console.log("camera system updated: ", device);
    }

    return systems;
  };

  this.systemArmed = async function (systemId) {
    const results = await blinkModule.isArmed().catch((error) => {
      console.log(error);
      throw error;
    });

    console.log("armed ", results);
    console.log("system id " + systemId);

    for (var id in results) {
      if (id.toString() === systemId.toString()) {
        const result = results[id];
        return result;
      }
    }

    const msg = "Error: could not find system " + systemId;
    console.log(msg);
    throw new Error(msg);
  };

  this.systemOnline = async function (systemId) {
    const results = await blinkModule.isOnline().catch((error) => {
      console.log(error);
      throw error;
    });

    console.log("online ", results);
    console.log("system id " + systemId);

    for (var id in results) {
      if (id.toString() === systemId.toString()) {
        const result = results[id];
        return result;
      }
    }

    const msg = "Error: could not find system " + systemId;
    console.log(msg);
    throw new Error(msg);
  };

  this.arm = async function (systemId, arm) {
    const result = await blinkModule
      .setArmed(arm, [systemId])
      .catch((error) => {
        console.log(error);
        throw error;
      });

    console.log("system id " + systemId);
    console.log("system ", result[systemId]);

    return result[systemId].command === "arm";
  };

  this.systemStatus = async function (device) {
    const self = this;

    const status = {
      armed: false,
      online: false,
    };

    const systemId = device.id;
    console.log("system ", systemId);

    try {
      const armed = await self.systemArmed(systemId);
      status.armed = armed;

      const online = await self.systemOnline(systemId);
      status.online = online;

      return status;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  this.update = async function (devices) {
    const self = this;

    const promises = [];
    for (let j = 0; j < devices.length; j++) {
      const device = devices[j];
      console.log("camera ", device);

      promises.push(self.status(device));
    }

    const results = await Promise.all(promises).catch((e) => {
      console.error("Error updating cameras: ", e);
      throw e;
    });

    for (let j = 0; j < results.length; j++) {
      const device = devices[j];
      const status = results[j];
      device.status = status;

      console.log("camera updated: ", device);
    }

    return devices;
  };

  this.status = async function (camera) {
    const system = camera.system;
    const cameraId = camera.id;

    const status = {};

    const cameras = await blinkModule.getCameras().catch((error) => {
      console.log(error);
      throw error;
    });

    // console.log(blink);
    // console.log('cameras: ' + JSON.stringify(cameras));
    for (var id in cameras) {
      const camera = cameras[id];
      if (camera.id.toString() === cameraId.toString()) {
        console.log("found camera " + camera.name + ", " + camera.id);
        status.temperature = camera.temperature;

        return status;
      }
    }

    const msg = "Error: could not find camera " + cameraId;
    console.log(msg);
    throw new Error(msg);
  };
};

module.exports = Camera;
