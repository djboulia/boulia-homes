const Blink = require("./lib/blink");
const Nest = require("./lib/nest");
const SmartThings = require("./lib/smartthings");
const Meross = require("./lib/merossgaragedoor");
const FloWaterValve = require("./lib/flowatervalve");
const KwiksetHalo = require("./lib/kwikset");

const Camera = require("./camera");
const Lock = require("./lock");
const Garage = require("./garage");
const Thermostat = require("./thermostat");
const Water = require("./water");

const loadBlink = function (cfg) {
  const blink = new Blink(cfg.email, cfg.password, cfg.app, cfg.device);

  return blink;
};

const loadNest = function (cfg) {
  const nest = new Nest(
    cfg.projectId,
    cfg.clientId,
    cfg.clientSecret,
    cfg.refreshToken
  );

  return nest;
};

const loadSmartThings = function (cfg) {
  const system = new SmartThings(cfg.accessToken);

  return system;
};

const loadMeross = function (cfg) {
  const system = new Meross(cfg.email, cfg.password);

  return system;
};

const loadFlo = function (cfg) {
  const system = new FloWaterValve(cfg.email, cfg.password);

  return system;
};

const loadKwiksetHalo = function (cfg) {
  const system = new KwiksetHalo(cfg.email, cfg.password);

  return system;
};

const Devices = function (config) {
  // configure the specific IoT services
  const blink = loadBlink(config.getBlink());
  const nest = loadNest(config.getNest());
  const smartThings = loadSmartThings(config.getSmartThings());
  const meross = loadMeross(config.getMeross());
  const flo = loadFlo(config.getFlo());
  const kwiksetHalo = loadKwiksetHalo(config.getKwiksetHalo());

  // abstract the different operations from the specific
  // service handlers so we can change vendors/implementations
  // without impacting all of the api code
  const camera = new Camera(blink);
  const thermostat = new Thermostat(nest);
  const lockSmartThings = new Lock(smartThings);
  const lockKwiksetHalo = new Lock(kwiksetHalo);
  const garage = new Garage(meross);
  const water = new Water(flo);

  this.init = function () {
    const promises = [];

    console.log("init all devices");

    promises.push(camera.init());
    promises.push(thermostat.init());
    promises.push(lockSmartThings.init());
    promises.push(lockKwiksetHalo.init());
    promises.push(garage.init());
    promises.push(water.init());

    return Promise.all(promises);
  };

  this.getThermostats = function () {
    return thermostat;
  };

  this.getGarages = function () {
    return garage;
  };

  this.getWaterValves = function () {
    return water;
  };

  const updateSystems = function (systems) {
    console.log("systems: ", systems);

    return new Promise((resolve, reject) => {
      const promises = [];

      const cameras = systems.cameras || [];
      const thermostats = systems.thermostats || [];

      // [djb 07/06/2025]
      //  the Kwikset Halo locks don't run through the SmartThings hub
      // we support both types, but filter so we can update each system
      const locksSmartThings =
        systems.locks?.filter((lock) => lock.type === "smartthings") || [];
      const locksKwiksetHalo =
        systems.locks?.filter((lock) => lock.type === "kwikset-halo") || [];
      const garages = systems.garages || [];
      const watervalves = systems.watervalves || [];

      promises.push(camera.updateSystem(cameras));
      promises.push(thermostat.updateSystem(thermostats));
      promises.push(lockSmartThings.updateSystem(locksSmartThings));
      promises.push(lockKwiksetHalo.updateSystem(locksKwiksetHalo));
      promises.push(garage.updateSystem(garages));
      promises.push(water.updateSystem(watervalves));

      Promise.all(promises)
        .then(() => {
          console.log("system updates complete");
          resolve(systems);
        })
        .catch((e) => {
          reject(e);
        });
    });
  };

  const updateZones = function (zones) {
    return new Promise((resolve, reject) => {
      const promises = [];

      for (let i = 0; i < zones.length; i++) {
        const zone = zones[i];
        const cameras = zone.cameras || [];
        const thermostats = zone.thermostats || [];

        promises.push(camera.update(cameras));
        promises.push(thermostat.updateSystem(thermostats));
      }

      Promise.all(promises)
        .then(() => {
          console.log("zones updates complete");
          resolve(zones);
        })
        .catch((e) => {
          reject(e);
        });
    });
  };

  this.updateHomeStatus = function (home) {
    return new Promise((resolve, reject) => {
      const updates = JSON.parse(JSON.stringify(home));

      updateSystems(updates.systems)
        .then((results) => {
          return updateZones(updates.zones);
        })
        .then((results) => {
          resolve(updates);
        })
        .catch((e) => {
          console.log("updateHomeStatus error: ", e);
        });
    });
  };

  /**
   * Arm all camera systems in this home
   *
   * @param {Object} home
   */
  this.armCameras = function (home, arm) {
    return new Promise((resolve, reject) => {
      const promises = [];

      const cameras = home.systems.cameras;
      for (let i = 0; i < cameras.length; i++) {
        const cameraSystem = cameras[i];

        promises.push(camera.arm(cameraSystem.id, arm));
      }

      Promise.all(promises)
        .then((results) => {
          const state = arm ? "arming" : "disarming";
          console.log(`camera system ${state} complete`);

          for (let i = 0; i < results.length; i++) {
            const result = results[i];
            if (result != arm) {
              console.log("camera did not " + (arm ? "arm" : "disarm"));
            }
          }

          resolve(arm);
        })
        .catch((e) => {
          reject(e);
        });
    });
  };

  /**
   * Set all thermostats systems in this home to eco
   *
   * @param {Object} home
   * @param {Boolean} eco true to set to eco mode, false to turn off eco mode
   */
  this.ecoThermostats = function (home, eco) {
    return new Promise((resolve, reject) => {
      const devices = home.systems.thermostats;

      thermostat
        .setSystemEco(devices, eco)
        .then((results) => {
          console.log("thermostat system eco mode complete");

          resolve(eco);
        })
        .catch((e) => {
          reject(e);
        });
    });
  };

  /**
   * Set all locks in this home to specified status
   *
   * @param {Object} home
   * @param {Boolean} locked
   */
  this.lockHome = async function (home, locked) {
    const devices = home.systems.locks;

    console.log("setting smartthings locks");

    const smartThingsLocks = devices.filter(
      (device) => device.type === "smartthings"
    );

    const resultsSmartThings = await lockSmartThings
      .setAll(smartThingsLocks, locked)
      .catch((e) => {
        throw e;
      });

    console.log("smartthings system lock complete");

    for (let i = 0; i < resultsSmartThings.length; i++) {
      const result = resultsSmartThings[i];
      if (result != locked) {
        console.log("lock not set to " + (locked ? "locked" : "unlocked"));
      }
    }

    // handle any halo locks
    console.log("setting kwikset locks");

    const kwiksetLocks = devices.filter(
      (device) => device.type === "kwikset-halo"
    );

    const resultsKwikset = await lockKwiksetHalo
      .setAll(kwiksetLocks, locked)
      .catch((e) => {
        throw e;
      });

    console.log("kwikset system lock complete");

    for (let i = 0; i < resultsKwikset.length; i++) {
      const result = resultsKwikset[i];
      if (result != locked) {
        console.log("lock not set to " + (locked ? "locked" : "unlocked"));
      }
    }

    return locked;
  };

  /**
   * Set all water valves in this home to specified status
   *
   * @param {Object} home
   * @param {Boolean} closed
   */
  this.shutOffWater = function (home, closed) {
    return new Promise((resolve, reject) => {
      const devices = home.systems.watervalves;

      water
        .closeAll(devices, closed)
        .then((results) => {
          console.log("system watervalve complete");

          for (let i = 0; i < results.length; i++) {
            const result = results[i];
            if (result != closed) {
              console.log("water not set to " + (closed ? "closed" : "open"));
            }
          }

          resolve(closed);
        })
        .catch((e) => {
          reject(e);
        });
    });
  };
};

module.exports = Devices;
