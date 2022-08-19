const MerossCloud = require('meross-cloud');

const MerossGarageDoor = function (email, password) {
    const CHANNEL = 0;
    
    const options = {
        'email': email,
        'password': password,
        'logger': console.log
    };
    
    const meross = new MerossCloud(options);

    meross.on('close', (deviceId, error) => {
        console.log('meross: ' + deviceId + ' closed: ' + error);
    });
    
    meross.on('error', (deviceId, error) => {
        console.log('meross: ' + deviceId + ' error: ' + error);
    });
    
    meross.on('reconnect', (deviceId) => {
        console.log('meross: ' + deviceId + ' reconnected');
    });
    
    meross.on('data', (deviceId, payload) => {
        console.log('meross: ' + deviceId + ' data: ' + JSON.stringify(payload));
    });
    
    this.initialized = false;

    this.init = function () {
        const self = this;

        return new Promise((resolve, reject) => {

            if (self.initialized) {
                console.log('meross already initialized, skipping');
                resolve(true);
            } else {

                meross.connect((error, deviceListLength) => {
                    if (error) {
                        // [06/13/2022] start eating errors logging in
                        //              so we don't prevent everything else
                        //              from loading
                        console.log(error);
                        resolve(0);
                    } else {
                        let connectedDevices = 0;
    
                        meross.on('connected', (deviceId) => {
                            console.log(deviceId + ' connected');
                            connectedDevices++;
    
                            if (connectedDevices === deviceListLength) {
                                console.log('all devices connected');

                                self.initialized = true;

                                resolve(deviceListLength);
                            }
                        });
                    }
                })
            }
        });
    }

    this.uninit = function () {
        return new Promise((resolve, reject) => {
            meross.disconnectAll();

            resolve();
        });

    }

    this.isOpen = function (id) {
        const self = this;

        return new Promise((resolve, reject) => {
            if (!self.initialized) {
                resolve(-1);
                return;
            }

            const device = meross.getDevice(id);

            if (!device) {
                const msg = 'could not find garage door ' + id;
                console.log(msg);
                reject(msg);
            }

            device.getSystemAllData((err, res) => {
                if (err) {
                    console.log('getSystemAllData error: ', err);
                    reject(err);
                } else {
                    const result = res.all.digest.garageDoor;
                    console.log('garageDoor: ', result);
    
                    // first entry is our door status
                    resolve(result[0].open);    
                }
            });
        });
    }
    
    this.open = function (id, open) {
        const self = this;

        return new Promise((resolve, reject) => {
            if (!self.initialized) {
                resolve(-1);
                return;
            }

            const device = meross.getDevice(id);

            if (!device) {
                const msg = 'could not find garage door ' + id;
                console.log(msg);
                reject(msg);
            }

            device.controlGarageDoor(1, open, (err) => {

                if (err) {
                    reject(err);
                } else {
                    // add a listener wiating for command to complete
                    meross.once('data', (deviceId, payload) => {
                        console.log('meross open: ' + deviceId + ' data: ' + JSON.stringify(payload));
                        if (deviceId === id) {
                            resolve(open);
                        }
                    });
                }
            });
        });
    }

    this.openAll = function (devices, open) {
        const self = this;
        const promises = [];

        for (let i = 0; i < devices.length; i++) {
            const device = devices[i];

            promises.push(self.open(device.id, open));
        }

        Promise.all(promises)
            .then((results) => {
                for (let j = 0; j < results.length; j++) {
                    const device = devices[j];

                    console.log('lock updated: ', device);
                }

                resolve(open);
            })
            .catch((e) => {
                reject(e);
            })
    }

}

module.exports = MerossGarageDoor;