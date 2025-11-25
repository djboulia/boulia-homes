/**
 * This is a generic lock interface that wraps around different lock providers,
 * allowing for a unified way to manage locks in a smart home system.
 */
const Lock = function (lockProvider) {
  this.init = function () {
    return lockProvider.init();
  };

  this.updateSystem = async function (systems) {
    const self = this;

    const promises = [];
    for (const device of systems) {
      console.log("updateSystem ", device);
      promises.push(self.systemStatus(device));
    }

    const results = await Promise.allSettled(promises);

    results.forEach((result, index) => {
      const device = systems[index];

      if (result.status === "rejected") {
        console.error("Error updating lock system: ", result.reason);
        device.status = undefined;
      } else {
        const status = result.value;
        device.status = status;
      }

      console.log("lock system updated: ", device);
    });

    return systems;
  };

  this.systemStatus = async function (device) {
    const status = {
      locked: false,
    };

    const systemId = device.id;
    console.log("system ", systemId);

    const lock = await lockProvider.getLock(systemId).catch((error) => {
      console.log(error);
      throw error;
    });

    status.lockState = lock.getLockState();
    return status;
  };

  this.setAll = async function (devices, locked) {
    const self = this;

    const promises = [];
    for (let j = 0; j < devices.length; j++) {
      const device = devices[j];
      console.log("setAll ", device);

      promises.push(self.set(device.id, locked));
    }

    const results = await Promise.allSettled(promises);

    results.forEach((result, index) => {
      const device = devices[index];

      if (result.status === "rejected") {
        console.log("Error updating lock: ", device);
      } else {
        console.log("lock updated: ", device);
      }
    });

    return results;
  };

  this.set = async function (deviceId, locked) {
    const lock = await lockProvider.getLock(deviceId).catch((error) => {
      console.log(error);
      throw error;
    });

    if (locked) {
      await lock.lock();
    } else {
      await lock.unlock();
    }
    return locked;
  };
};

module.exports = Lock;
