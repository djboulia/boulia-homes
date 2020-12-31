const Thermostat = function (nest) {
    this.init = function () {
        return nest.init();
    }

    this.status = function (device) {
        console.log('nest id ' + device.id);

        return new Promise((resolve, reject) => {
            nest.getThermostat(device.id)
                .then((thermostat) => {

                    resolve({
                        temperature: thermostat.getTemperature(),
                        mode: thermostat.getMode(),
                        status: thermostat.getHvacStatus(),
                        eco: thermostat.isEcoMode()
                    });
                })
                .catch((e) => {
                    reject(e);
                })
        });
    }

    this.setEco = function (device, eco) {
        console.log('nest id ' + device.id);

        return new Promise((resolve, reject) => {
            nest.getThermostat(device.id)
                .then((thermostat) => {
                    thermostat.setEcoMode(eco)
                        .then((result) => {
                            resolve(thermostat.isEcoMode());
                        })
                        .catch((e) => {
                            reject(e);
                        })
                })
                .catch((e) => {
                    reject(e);
                })
        });
    }
    
    this.updateSystem = function (devices) {
        const self = this;

        return new Promise((resolve, reject) => {
            nest.deviceList()
                .then(() => {
                    const promises = [];

                    for (let j = 0; j < devices.length; j++) {
                        const device = devices[j];
                        console.log('thermostat ', device);

                        promises.push(self.status(device));
                    }

                    Promise.all(promises)
                        .then((results) => {
                            for (let j = 0; j < results.length; j++) {
                                const device = devices[j];
                                const status = results[j];
                                device.status = status;

                                console.log('thermostat updated: ', device);
                            }

                            resolve(devices);
                        })
                        .catch((e) => {
                            reject(e);
                        })
                })
        })
    }

    this.setSystemEco = function (devices, eco) {
        const self = this;

        return new Promise((resolve, reject) => {
            nest.deviceList()
                .then(() => {
                    const promises = [];

                    for (let j = 0; j < devices.length; j++) {
                        const device = devices[j];
                        console.log('thermostat ', device);

                        promises.push(self.setEco(device, eco));
                    }

                    Promise.all(promises)
                        .then((results) => {
                            for (let j = 0; j < results.length; j++) {
                                const device = devices[j];

                                console.log('thermostat updated: ', device);
                            }

                            resolve(eco);
                        })
                        .catch((e) => {
                            reject(e);
                        })
                })
        })
    }
}

module.exports = Thermostat;