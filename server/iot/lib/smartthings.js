const smartthings = require('smartthings-node');
const SmartThingsLock = require('./smartthings-lock');

const SmartThings = function (accessToken) {
    let st = undefined;

    this.init = function() {
        return new Promise((resolve, reject) => {

            if (st) {
                // only need to initialize once
                resolve(true);
            } else {
                st = new smartthings.SmartThings(accessToken);
                resolve(true);
            }
        })
    }

    this.listLocks = function () {
        return new Promise((resolve, reject) => {
            st.devices.listDevicesByCapability('lock')
                .then(deviceList => {

                    const items = deviceList.items;
                    resolve(items);
                })
                .catch((e) => {
                    console.error('error ', e);
                    reject(e);
                })
        })
    }

    this.getLock = function (deviceId) {
        return new Promise((resolve, reject) => {
            console.log('deviceId: ' + deviceId);

            st.devices.getDeviceStatus(deviceId)
                .then((status) => {
                    console.log('lock status ', status);

                    resolve(new SmartThingsLock(st, deviceId, status));
                })
                .catch((e) => {
                    console.error('error ', e);
                    reject(e);
                })
        })
    }
}

module.exports = SmartThings;