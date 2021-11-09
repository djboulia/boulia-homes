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

    this.init = function () {
        return flo.init();
    }

    this.uninit = function () {
        return new Promise((resolve, reject) => {
            // no uninit for this device, just return
            resolve();
        });

    }

    const findDevice = function(id) {
        for (let i=0; i<flo.flo_devices.length; i++) {
            const device = flo.flo_devices[i];

            if (device.deviceid === id) {
                return device;
            }
        }

        return undefined;
    }

    this.isValveOpen = function (id) {
        return new Promise((resolve, reject) => {
            flo.discoverDevices()
            .then((result) => {
                const device = findDevice(id);

                if (device === undefined) {
                    reject('device id ' + id + ' not found!');
                    return;
                }

                // console.log('discovered devices ', flo.flo_devices)

                console.log("waterValve ", device);
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