const Camera = function (blink) {
    let blinkModule = undefined;

    /**
     * initialize or refresh the camera info
     */
    this.init = function () {
        return new Promise((resolve, reject) => {
            blink.init()
                .then((module) => {
                    blinkModule = module;

                    console.log('setting up blink library');
                    return blinkModule.setupSystem();
                })
                .then(() => {
                    resolve();
                })
                .catch((e) => {
                    reject(e);
                })
        });
    }

    this.updateSystem = function (systems) {
        const self = this;

        return new Promise((resolve, reject) => {
            const promises = [];
            for (let j = 0; j < systems.length; j++) {
                const device = systems[j];
                console.log('updateSystem ', device);

                promises.push(self.systemStatus(device));
            }

            Promise.all(promises)
                .then((results) => {
                    for (let j = 0; j < results.length; j++) {
                        const device = systems[j];
                        const status = results[j];
                        device.status = status;

                        console.log('camera system updated: ', device);
                    }

                    resolve(systems);
                })
                .catch((e) => {
                    reject(e);
                })
        })
    }

    this.systemArmed = function (systemId) {
        return new Promise((resolve, reject) => {

            blinkModule.isArmed()
                .then((results) => {

                    console.log('armed ', results);
                    console.log('system id ' + systemId);

                    for (var id in results) {
                        if (id.toString() === systemId.toString()) {
                            const result = results[id];
                            resolve(result);
                            return;
                        }
                    }

                    const msg = 'Error: could not find system ' + systemId;
                    console.log(msg);
                    reject(msg);
                })
                .catch((error) => {
                    console.log(error);
                    reject(error);
                });
        });
    }

    this.systemOnline = function (systemId) {
        return new Promise((resolve, reject) => {

            blinkModule.isOnline()
                .then((results) => {

                    console.log('online ', results);
                    console.log('system id ' + systemId);

                    for (var id in results) {
                        if (id.toString() === systemId.toString()) {
                            const result = results[id];
                            resolve(result);
                            return;
                        }
                    }

                    const msg = 'Error: could not find system ' + systemId;
                    console.log(msg);
                    reject(msg);
                })
                .catch((error) => {
                    console.log(error);
                    reject(error);
                });
        });
    }

    this.arm = function (systemId, arm) {
        return new Promise((resolve, reject) => {

            blinkModule.setArmed(arm, [systemId])
                .then((result) => {

                    console.log('system id ' + systemId);
                    console.log('system ', result[systemId]);

                    resolve(result[systemId].command === 'arm');
                })
                .catch((error) => {
                    console.log(error);
                    reject(error);
                });
        });
    }

    this.systemStatus = function (device) {
        const self = this;

        return new Promise((resolve, reject) => {
            const status = {
                armed: false,
                online: false
            };

            const systemId = device.id;
            console.log('system ', systemId);

            self.systemArmed(systemId)
                .then((result) => {
                    status.armed = result;

                    return self.systemOnline(systemId);
                })
                .then((result) => {
                    status.online = result;

                    resolve(status);
                })
                .catch((error) => {
                    console.log(error);
                    reject(error);
                });
        });
    }

    this.update = function (devices) {
        const self = this;

        return new Promise((resolve, reject) => {
            const promises = [];
            for (let j = 0; j < devices.length; j++) {
                const device = devices[j];
                console.log('camera ', device);

                promises.push(self.status(device));
            }

            Promise.all(promises)
                .then((results) => {
                    for (let j = 0; j < results.length; j++) {
                        const device = devices[j];
                        const status = results[j];
                        device.status = status;

                        console.log('camera updated: ', device);
                    }

                    resolve(devices);
                })
                .catch((e) => {
                    reject(e);
                })
        })
    }

    this.status = function (camera) {
        return new Promise((resolve, reject) => {
            const system = camera.system;
            const cameraId = camera.id;

            const status = {};

            blinkModule.getCameras()
                .then((cameras) => {

                    // console.log(blink);
                    // console.log('cameras: ' + JSON.stringify(cameras));
                    for (var id in cameras) {
                        const camera = cameras[id];
                        if (camera.id.toString() === cameraId.toString()) {
                            console.log('found camera ' + camera.name + ', ' + camera.id);
                            status.temperature = camera.temperature;

                            resolve(status);
                            return;
                        }
                    }

                    const msg = 'Error: could not find camera ' + cameraId;
                    console.log(msg);
                    reject(msg);
                })
                .catch((error) => {
                    console.log(error);
                    reject(error);
                });
        });
    }
}

module.exports = Camera;
