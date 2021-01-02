/**
 * wrapper for Nest API
 */

const axios = require('axios');
const NestThermostat = require('./nest-thermostat');

const Cache = function( cacheInterval ) {
    let cacheObj = undefined;
    let cacheTime = 0;

    this.get = function() {

        if (cacheObj) {
            const now = new Date();

            if (now.getTime() >= (cacheTime + cacheInterval)) {
                console.log('Cache: expired, resetting device list');
                cacheObj = null;
            } else {
                console.log('Cache: hit');
            }
        } else {
            console.log('Cache: no cache item set.');
        }

        return cacheObj;
    }

    this.put = function( obj ) {
        const now = new Date();

        console.log('Cache: setting cache item at ' + now.getTime());

        cacheObj = obj;
        cacheTime = now.getTime();

        return cacheObj;
    }
};

const buildRefreshUrl = function (clientId, clientSecret, refreshToken) {
    const url = 'https://www.googleapis.com/oauth2/v4/token?' +
        'client_id=' + clientId + '&' +
        'client_secret=' + clientSecret + '&' +
        'refresh_token=' + refreshToken + '&' +
        'grant_type=refresh_token';

    // console.log('refresh url :', url);

    return url;
}

const smartDeviceUrl = 'https://smartdevicemanagement.googleapis.com/v1';

const buildDevicePath = function (projectId, deviceId) {
    return 'enterprises/' + projectId +
        '/devices/' + deviceId;
}

const buildDeviceListUrl = function (projectId) {
    const url = smartDeviceUrl + '/enterprises/' +
        projectId + '/devices';

    // console.log('device list url :', url);

    return url;
}

const buildDeviceCommandUrl = function (projectId, deviceId) {
    const url = smartDeviceUrl + '/' +
        buildDevicePath(projectId, deviceId) +
        ':executeCommand';

    // console.log('device command url :', url);

    return url;
}

const Nest = function (projectId, clientId, clientSecret, refreshToken) {
    const deviceCache = new Cache(1000); // 1 second

    let accessToken = undefined;
    let expireTime = 0;

    this.init = function () {
        return new Promise((resolve, reject) => {
            const now = new Date();

            if (accessToken && (now.getTime() < expireTime)) {
                console.log('nest access token still valid, expires in ' + Math.floor((expireTime - now.getTime())/60000) + ' minutes.');
                resolve(accessToken);
            } else {
                if (accessToken) {
                    // prior init call created an accessToken, but it's now expired
                    console.log('nest access token expired, refreshing');
                }

                axios.post(buildRefreshUrl(clientId, clientSecret, refreshToken))
                    .then((res) => {
                        const result = res.data;
                        const now = new Date();

                        accessToken = result.access_token;
                        expireTime = now.getTime() + (result.expires_in * 1000);

                        resolve(accessToken);
                    })
                    .catch((e) => {
                        reject(e);
                    })
            }
        })
    }

    this.deviceList = function () {
        return new Promise((resolve, reject) => {

            const deviceList = deviceCache.get();

            if (deviceList) {
                resolve(deviceList);
            } else {
                const options = {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + accessToken
                    },
                };
    
                axios.get(buildDeviceListUrl(projectId), options)
                    .then((res) => {
                        const result = res.data;

                        deviceCache.put(result);

                        console.log('device list: ', result);
                        resolve(result);
                    })
                    .catch((e) => {
                        reject(e);
                    })
            }
        })
    }

    this.getThermostat = function (deviceId) {
        const self = this;

        return new Promise((resolve, reject) => {
            this.deviceList()
                .then((result) => {
                    const devices = result.devices;

                    for (let i = 0; i < devices.length; i++) {
                        const device = devices[i];

                        if (device.name === buildDevicePath(projectId, deviceId)) {
                            if (device.type === 'sdm.devices.types.THERMOSTAT') {
                                resolve(new NestThermostat(self, deviceId, device));
                                return;
                            } else {
                                reject('Device id is not a thermostat!');
                                return;
                            }
                        }
                    }

                    reject('No device id ' + deviceId + ' found.');
                })
                .catch((e) => {
                    reject(e);
                })
        })
    }

    /**
     * Return a promise for a command object to set traits on the device
     * 
     * @param {String} deviceId 
     * @param {String} command 
     * @param {Object} params 
     */
    this.command = function (deviceId, command, params) {
        const options = {
            method: 'POST',
            url: buildDeviceCommandUrl(projectId, deviceId),
            data: {
                "command": command,
                "params": params
            },
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + accessToken
            },
        };

        return axios(options);
    }
}

module.exports = Nest;