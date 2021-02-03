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
                        targetTemperature: thermostat.getTemperatureSetPoint(),
                        status: thermostat.getHvacStatus(),
                        eco: thermostat.isEcoMode(),
                        ecoHeat: thermostat.ecoHeat(),
                        ecoCool: thermostat.ecoCool(),
                    });
                })
                .catch((e) => {
                    reject(e);
                })
        });
    }

    this.setEco = function (id, eco) {
        console.log('nest id ' + id);

        return new Promise((resolve, reject) => {
            nest.getThermostat(id)
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

    this.setMode = function (id, mode) {
        console.log('nest id ' + id);

        return new Promise((resolve, reject) => {
            nest.getThermostat(id)
                .then((thermostat) => {
                    thermostat.setMode(mode)
                        .then((result) => {
                            resolve(thermostat.getMode());
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

    this.setTemp = function (id, mode, temp) {
        console.log('nest id ' + id);

        return new Promise((resolve, reject) => {
            nest.getThermostat(id)
                .then((thermostat) => {
                    let promise = undefined;

                    if (mode === 'HEAT') {
                        promise = thermostat.setHeatTemperature(temp);
                    } else if (mode === 'COOL') {
                        promise = thermostat.setCoolTemperature(temp);
                    }

                    if (!promise) {
                        reject('Invalid mode ' + mode);
                        return;
                    }

                    promise
                        .then((result) => {
                            resolve(result);
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

                        promises.push(self.setEco(device.id, eco));
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