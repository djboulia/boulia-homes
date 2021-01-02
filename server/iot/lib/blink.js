/**
 * wrapper for Nest API
 */

const axios = require('axios');
const BlinkModule = require('node-blink-security');

// node-blink-security doesn't have a concept of refreshing the 
// auth token, but it appears to expire on the blink side after 24 
// hours. since we run this library in a long running task on the 
// server, we need to refresh the token.  We wrap the underlying Blink 
// module with this class which will reload the library every so often 
// to force a refresh of the token

const refreshBlinkModule = function(email, password, app, device) {
    return new BlinkModule(
        email,
        password,
        app,
        {
            auth_2FA: true,
            device_name: device
        });
}

const Blink = function (email, password, app, device) {
    const tokenDuration = 6 * 60 * 60 * 1000;   // 6 hours

    let blinkModule = undefined;
    let expireTime = 0;

    this.init = function () {
        return new Promise((resolve, reject) => {
            const now = new Date();

            if (now.getTime() < expireTime) {
                console.log('blink access token still valid, expires in ' + Math.floor((expireTime - now.getTime())/60000) + ' minutes.');
                resolve(blinkModule);
            } else {
                // prior init call created an accessToken, but it's now expired
                console.log('blink access token expired, refreshing');

                blinkModule = refreshBlinkModule(email, password, app, device);
                expireTime = now.getTime() + tokenDuration;

                resolve(blinkModule);
            }
        })
    }
}

module.exports = Blink;