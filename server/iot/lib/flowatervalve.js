// we use the homebridge Flo package even though we're not using homebridge
// instead of loading the main module, we load the module that implements
// the core flo API
const Flo = require('homebridge-flobymoen/flomain');

const FloWaterValve = function (email, password) {
    const config = {
        auth: {
            username: email,
            password: password
        }
    };

    const logger = {
        info: console.log,
        debug: console.debug,
        error: console.error
    }

    const flo = new Flo(logger, config, undefined, console.debug);

    this.initComplete = false;

    this.init = function () {
        const self = this;

        return new Promise((resolve, reject) => {
            if (self.initComplete) {
                console.log("flo initialized previously");
                resolve(true);
            } else {
                console.log("flo initialization starting");

                flo.init()
                .then((result) => {
                    console.log("flo initialization complete");

                    self.initComplete = true;
    
                    // only call discoverDevices() once... multiple
                    // calls will continue adding to the flo_devices array
                    return flo.discoverDevices();
                })
                .then((result) => {
                    // console.log('discovered devices ', flo.flo_devices)
                    resolve(true);
                })
                .catch((e) => {
                    reject(e);
                })
            }
        });
    }

    this.uninit = function () {
        return new Promise((resolve, reject) => {
            // no uninit for this device, just return
            resolve();
        });

    }

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
    }

    this.isValveOpen = function (id) {
        return new Promise((resolve, reject) => {
            const index = findDevice(id);
            const device = (index===undefined) ? undefined : flo.flo_devices[index];
            
            if (index === undefined) {
                reject('device id ' + id + ' not found!');
                return;
            }

            console.log('flo device: ', device);

            flo.refreshDevice(index)
                .then((result) => {

                    console.log("waterValve ", id);
                    resolve((device.valveCurrentState === 'closed') ? false : true);
                })
                .catch((err) => {
                    console.log("error: ", err)
                    reject(err);
                })
        });
    }

    this.setValve = function (id, open) {
        return flo.setValve(id, (open) ? 'open' : 'closed');
    }

}

module.exports = FloWaterValve;