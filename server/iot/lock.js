
const Lock = function (st) {

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

                        console.log('lock system updated: ', device);
                    }

                    resolve(systems);
                })
                .catch((e) => {
                    reject(e);
                })
        })
    }

    this.systemStatus = function (device) {
        const self = this;

        return new Promise((resolve, reject) => {
            const status = {
                locked: false,
            };

            const systemId = device.id;
            console.log('system ', systemId);

            st.getLock(systemId)
                .then((stLock) => {
                    status.locked = stLock.isLocked();
                    resolve(status);
                })
                .catch((error) => {
                    console.log(error);
                    reject(error);
                });
        });
    }

    this.lockAll = function (devices, locked) {
        const self = this;

        return new Promise((resolve, reject) => {
            const promises = [];
            for (let j = 0; j < devices.length; j++) {
                const device = devices[j];
                console.log('lockAll ', device);

                promises.push(self.lock(device.id, locked));
            }

            Promise.all(promises)
                .then((results) => {
                    for (let j = 0; j < results.length; j++) {
                        const device = devices[j];

                        console.log('lock updated: ', device);
                    }

                    resolve(locked);
                })
                .catch((e) => {
                    reject(e);
                })
        })
    }

    this.lock = function (deviceId, locked) {
        return new Promise((resolve, reject) => {

            st.getLock(deviceId)
                .then((stLock) => {
                    const promise = (locked) ? stLock.lock() : stLock.unlock();

                    promise
                        .then((result) => {
                            resolve(locked);
                        })
                        .catch((error) => {
                            console.log(error);
                            reject(error);
                        });
                })
        });
    }
}

module.exports = Lock;
