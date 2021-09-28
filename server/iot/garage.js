
const Garage = function (meross) {

    meross.init();

    this.updateSystem = function (systems) {
        const self = this;

        return new Promise((resolve, reject) => {
            const promises = [];
            for (let j = 0; j < systems.length; j++) {
                const device = systems[j];
                console.log('updateSystem ', device);

                promises.push(self.systemStatus(device));
            }

            Promise.all(promises)
                .then((results) => {
                    for (let j = 0; j < results.length; j++) {
                        const device = systems[j];
                        const status = results[j];
                        device.status = status;

                        console.log('garage system updated: ', device);
                    }

                    resolve(systems);
                })
                .catch((e) => {
                    reject(e);
                })
        })
    }

    this.systemStatus = function (device) {

        return new Promise((resolve, reject) => {
            const status = {
                open: false,
            };

            const systemId = device.id;
            console.log('system ', systemId);

            meross.isOpen(systemId)
                .then((result) => {
                    status.open = result;
                    resolve(status);
                })
                .catch((error) => {
                    console.log(error);
                    reject(error);
                });
        });
    }

    this.openAll = function (devices, open) {
        const self = this;

        return new Promise((resolve, reject) => {
            const promises = [];
            for (let j = 0; j < devices.length; j++) {
                const device = devices[j];
                console.log('openAll ', device);

                promises.push(self.open(device.id, open));
            }

            Promise.all(promises)
                .then((results) => {
                    for (let j = 0; j < results.length; j++) {
                        const device = devices[j];

                        console.log('garage updated: ', device);
                    }

                    resolve(open);
                })
                .catch((e) => {
                    reject(e);
                })
        })
    }

    this.open = function (deviceId, open) {
        return new Promise((resolve, reject) => {

            meross.open(deviceId, open)
                .then((result) => {
                    resolve(result);
                })
                .catch((error) => {
                    console.log(error);
                    reject(error);
                })
        });
    }
}

module.exports = Garage;
