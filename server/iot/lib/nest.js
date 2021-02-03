/**
 * wrapper for Nest API
 */

const axios = require('axios');
const NestThermostat = require('./nest-thermostat');

/**
 * implement a wrapper around axios calls to prevent us from
 * exceeding the rate limit for Google APIs. The limit is 
 * 5 queries per minute, so we delay our call if we hit the
 * limit within that time frame
 */
const ThrottledAxios = function (callsPerMinute) {
    const MINUTE = 1000 * 60;
    let lastInterval = 0;
    let callsThisInterval = 0;

    const timeLeft = function () {
        let left = 0;
        const now = Date.now();

        if (lastInterval + MINUTE > now) {
            left = (lastInterval + MINUTE) - now;
        }

        console.log('throttler: secs left: ' + Math.floor(left / 1000));
        return left;
    }

    const underTheLimit = function () {
        // if we're under the call limit, cool
        if (callsThisInterval < callsPerMinute) {
            return true;
        }

        // we're at the call limit, see if we're
        // still within the minute interval
        return timeLeft() === 0;
    }

    const makeCall = function () {
        if (timeLeft() === 0) {
            // reset the counter
            callsThisInterval = 1;
            lastInterval = Date.now();
            console.log('throttler: resetting counter');
        } else {
            // still within a minute, bump the counter
            callsThisInterval++;
            console.log('throttler: ' + callsThisInterval + ' calls made this interval.');
        }
    }

    this.get = function (url, options) {
        if (underTheLimit()) {
            console.log('throttler: get proceeding');
            makeCall();
            return axios.get(url, options);
        } else {
            return new Promise((resolve, reject) => {
                console.log('throttler: get waiting');
                setTimeout(() => {
                    makeCall();

                    console.log('throttler: get proceeding after wait');

                    axios.get(url, options)
                        .then((result) => {
                            resolve(result);
                        })
                        .catch((e) => {
                            reject(e);
                        })
                }, timeLeft());
            })
        }
    }

    this.post = function (url, data, headers) {
        const options = {
            method: 'POST',
            url: url,
            data: data,
            headers: headers,
        };

        if (underTheLimit()) {
            console.log('throttler: post proceeding');

            makeCall();

            return axios(options);
        } else {
            return new Promise((resolve, reject) => {
                console.log('throttler: post waiting');
                setTimeout(() => {
                    makeCall();

                    console.log('throttler: post proceeding after wait');

                    axios(options)
                        .then((result) => {
                            resolve(result);
                        })
                        .catch((e) => {
                            reject(e);
                        })
                }, timeLeft());
            })
        }
    }
};

const Cache = function (cacheInterval) {
    let cacheObj = undefined;
    let cacheTime = 0;

    this.get = function () {

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

    this.put = function (obj) {
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
    const deviceCache = new Cache(2000); // 2 seconds
    const throttler = new ThrottledAxios(5); // limit to 5 calls per minute

    let accessToken = undefined;
    let expireTime = 0;

    this.init = function () {
        return new Promise((resolve, reject) => {
            const now = new Date();

            if (accessToken && (now.getTime() < expireTime)) {
                console.log('nest access token still valid, expires in ' + Math.floor((expireTime - now.getTime()) / 60000) + ' minutes.');
                resolve(accessToken);
            } else {
                if (accessToken) {
                    // prior init call created an accessToken, but it's now expired
                    console.log('nest access token expired, refreshing');
                }

                // we don't need to throttle the refresh token
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

    // queue up multiple device lists calls so we don't flood
    // the system with them
    const deviceListQueue = [];

    this.deviceList = function () {
        return new Promise((resolve, reject) => {

            const deviceList = deviceCache.get();

            if (deviceList) {
                resolve(deviceList);
            } else {

                // put it on a queue
                deviceListQueue.push({ resolve, reject });

                // if we're the first person on the queue, 
                // proceed.  other calls will just be added to the queue
                if (deviceListQueue.length === 1) {
                    console.log('deviceList: making call');

                    const options = {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + accessToken
                        },
                    };

                    throttler.get(buildDeviceListUrl(projectId), options)
                        .then((res) => {
                            console.log('deviceList: call complete');

                            const result = res.data;

                            deviceCache.put(result);

                            console.log('device list: ', result);

                            // go resolve all of the outstanding requests
                            while (deviceListQueue.length > 0) {
                                const call = deviceListQueue.pop();

                                call.resolve(result);
                            }
                        })
                        .catch((e) => {
                            console.log('deviceList: error');

                            // error occurred - reject all of the outstanding requests
                            while (deviceListQueue.length > 0) {
                                const call = deviceListQueue.pop();

                                call.reject(e);
                            }
                        })
                } else {
                    console.log('deviceList: queueing call. queue length: ' + deviceListQueue.length);
                }
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
        const url = buildDeviceCommandUrl(projectId, deviceId);
        const data = {
            "command": command,
            "params": params
        };
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + accessToken
        };

        return throttler.post(url, data, headers);
    }
}

module.exports = Nest;