const Water = function (flo) {
  this.init = function () {
    return flo.init();
  };

  this.updateSystem = function (systems) {
    const self = this;

    return new Promise((resolve, reject) => {
      const promises = [];
      for (let j = 0; j < systems.length; j++) {
        const device = systems[j];
        console.log("updateSystem ", device);

        promises.push(self.systemStatus(device));
      }

      Promise.all(promises)
        .then((results) => {
          for (let j = 0; j < results.length; j++) {
            const device = systems[j];
            const status = results[j];
            device.status = status;

            console.log("watervalve system updated: ", device);
          }

          resolve(systems);
        })
        .catch((e) => {
          reject(e);
        });
    });
  };

  this.systemStatus = async function (device) {
    const status = {
      open: undefined,
    };

    const systemId = device.id;
    console.log("system ", systemId);

    result = await flo.isValveOpen(systemId).catch((error) => {
      console.log(error);
      return undefined; // could be offline, return undefined status
    });

    status.open = result;
    return status;
  };

  this.closeAll = function (devices, closed) {
    const self = this;

    return new Promise((resolve, reject) => {
      const promises = [];
      for (let j = 0; j < devices.length; j++) {
        const device = devices[j];
        console.log("closeAll ", device);

        promises.push(self.close(device.id, closed));
      }

      Promise.all(promises)
        .then((results) => {
          for (let j = 0; j < results.length; j++) {
            const device = devices[j];

            console.log("water updated: ", device);
          }

          resolve(closed);
        })
        .catch((e) => {
          reject(e);
        });
    });
  };

  this.close = function (deviceId, closed) {
    return new Promise((resolve, reject) => {
      flo
        .setValve(deviceId, !closed)
        .then(() => {
          // flo doesn't return the state, but we
          // assume a positive result means it has been
          // set to the new state
          resolve(closed);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  };
};

module.exports = Water;
