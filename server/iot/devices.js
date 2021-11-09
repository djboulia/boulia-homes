
const Devices = function (camera, thermostat, lock, garage, water) {

    this.init = function () {
        const promises = [];

        console.log('init all devices');

        promises.push(camera.init());
        promises.push(thermostat.init());
        promises.push(garage.init());
        promises.push(water.init());

        return Promise.all(promises);
    }

    this.getThermostats = function () {
        return thermostat;
    }

    this.getGarages = function () {
        return garage;
    }

    this.getWaterValves = function () {
        return water;
    }

    const updateSystems = function (systems) {
        console.log('systems: ', systems);

        return new Promise((resolve, reject) => {
            const promises = [];

            const cameras = systems.cameras || [];
            const thermostats = systems.thermostats || [];
            const locks = systems.locks || [];
            const garages = systems.garages || [];
            const watervalves = systems.watervalves || [];

            promises.push(camera.updateSystem(cameras));
            promises.push(thermostat.updateSystem(thermostats));
            promises.push(lock.updateSystem(locks));
            promises.push(garage.updateSystem(garages));
            promises.push(water.updateSystem(watervalves));

            Promise.all(promises)
                .then((results) => {
                    console.log('system updates complete');
                    resolve(systems);
                })
                .catch((e) => {
                    reject(e);
                })
        })
    }

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
                .then((results) => {
                    console.log('zones updates complete');
                    resolve(zones);
                })
                .catch((e) => {
                    reject(e);
                })
        })
    }

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
                    console.log('updateHomeStatus error: ', e);
                })
        })
    }

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
                    console.log('camera system arming complete');

                    for (let i = 0; i < results.length; i++) {
                        const result = results[i];
                        if (result != arm) {
                            console.log('camera did not ' + ((arm) ? 'arm' : 'disarm'));
                        }
                    }

                    resolve(arm);
                })
                .catch((e) => {
                    reject(e);
                })
        })
    }

    /**
     * Set all thermostats systems in this home to eco
     * 
     * @param {Object} home 
     * @param {Boolean} eco true to set to eco mode, false to turn off eco mode
     */
    this.ecoThermostats = function (home, eco) {
        return new Promise((resolve, reject) => {

            const devices = home.systems.thermostats;

            thermostat.setSystemEco(devices, eco)
                .then((results) => {
                    console.log('thermostat system eco mode complete');

                    resolve(eco);
                })
                .catch((e) => {
                    reject(e);
                })
        })
    }


    /**
     * Set all locks in this home to specified status
     * 
     * @param {Object} home 
     * @param {Boolean} locked
     */
    this.lockHome = function (home, locked) {
        return new Promise((resolve, reject) => {

            const devices = home.systems.locks;

            lock.lockAll(devices, locked)
                .then((results) => {
                    console.log('system lock complete');

                    for (let i = 0; i < results.length; i++) {
                        const result = results[i];
                        if (result != locked) {
                            console.log('thermostat not set to ' + ((locked) ? 'locked' : 'unlocked'));
                        }
                    }

                    resolve(locked);
                })
                .catch((e) => {
                    reject(e);
                })
        })
    }

    /**
     * Set all locks in this home to specified status
     * 
     * @param {Object} home 
     * @param {Boolean} closed
     */
    this.shutOffWater = function (home, closed) {
        return new Promise((resolve, reject) => {

            const devices = home.systems.watervalves;

            water.closeAll(devices, closed)
                .then((results) => {
                    console.log('system watervalve complete');

                    for (let i = 0; i < results.length; i++) {
                        const result = results[i];
                        if (result != closed) {
                            console.log('water not set to ' + ((closed) ? 'closed' : 'open'));
                        }
                    }

                    resolve(closed);
                })
                .catch((e) => {
                    reject(e);
                })
        })
    }
}




module.exports = Devices;
