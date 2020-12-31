const smartthings = require('smartthings-node');
const SmartThingsLock = require('./smartthings-lock');

const SmartThings = function (accessToken) {
    const st = new smartthings.SmartThings(accessToken);

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