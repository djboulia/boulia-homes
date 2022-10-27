/**
 * 
 * Backend API for the home automation app
 *
 */

const ReactServer = require('@apiserver/reactserver');

const Config = require('./config');

const Models = require('./models');
const Users = Models.getUsers(Config);
const Homes = Models.getHomes(Config);

const Devices = require('./iot/devices');
const devices = new Devices(Config);

const ApiServer = function (reactClientDir) {
    // core react server handling functions
    const server = new ReactServer(reactClientDir);

    this.start = function (port) {

        // handlers for our backend API entry points
        async function login(context) {
            console.log("got body: ", context.body);
            const session = context.session;
            const body = context.body || {};

            // login attempt resets session data
            session.user = undefined;

            // for now, just return a positive response if there is any user/pass given
            const userid = body.userid;
            const password = body.password;

            const result = await Users.authenticate(userid, password)
                .catch((err) => {
                    throw server.serverError(401, err);
                });

            session.user = result;

            return {
                user: result
            };
        }

        async function logout(context) {
            console.log("logout ");

            await server.reset(context.session);

            return {
                message: 'Logged out.'
            };
        }

        /**
         * called to validate the user is authorized
         * to call the given API
         * 
         * @param {*} context 
         */
        async function auth(context) {
            console.log('auth called');

            const user = context.session.user;

            if (!user) {
                throw server.serverError(401, 'Please log in.');
            }

            return true;
        }

        async function initDevices(context) {
            await devices.init()
                .catch((err) => {
                    throw new Error('Error initializing devices.');
                });
        }

        /**
         * get homes for the current user
         */
        async function homes(context) {
            const user = context.session.user;

            await initDevices(context);

            const result = await Homes.findByIds(user.homes);

            // get current status for all devices
            const promises = [];

            for (let i = 0; i < result.length; i++) {
                const home = result[i];

                promises.push(devices.updateHomeStatus(home));
            }

            const results =
                await Promise.all(promises)
                    .catch((err) => {
                        throw new Error('Error updating home status.');
                    });

            return {
                homes: results
            };
        }

        const findHomeById = function (homes, id) {
            for (let i = 0; i < homes.length; i++) {
                const home = homes[i];

                if (home._id === id) {
                    return home;
                }
            }

            return undefined;
        }

        async function getHome(homesList, id) {
            const homes =
                await Homes.findByIds(homesList)
                    .catch((err) => {
                        throw new Error('Error retrieving homes.');
                    })

            const home = findHomeById(homes, id);
            if (!home) {
                throw server.serverError(404, `Home id ${id} not found.`);
            }

            return home;
        }

        async function toggleCameras(context) {
            const body = context.body;
            const params = context.params;
            const session = context.session;

            console.log("got body: ", body);
            const id = params.id;

            const user = session.user;

            await initDevices(context);

            const home = await getHome(user.homes, id);

            const result =
                await devices.armCameras(home, body.arm)
                    .catch((err) => {
                        throw new Error('Error arming cameras.');
                    })

            return {
                armed: result
            };
        }

        async function toggleDoors(context) {
            const body = context.body;
            const params = context.params;
            const session = context.session;

            console.log("got body: ", body);

            const id = params.id;
            console.log("got id: ", id);

            const user = session.user;

            await initDevices(context);

            const home = await getHome(user.homes, id);

            const result =
                await devices.lockHome(home, body.locked)
                    .catch((err) => {
                        throw new Error('Error setting door locks.');
                    })

            return {
                locked: result
            };
        }

        /**
         * close or open all water valves in the home
         */
        async function toggleWater(context) {
            const body = context.body;
            const params = context.params;
            const session = context.session;

            console.log("got body: ", body);

            const id = params.id;
            console.log("got id: ", id);

            const user = session.user;

            await initDevices(context);

            const home = await getHome(user.homes, id);

            const result =
                await devices.shutOffWater(home, body.closed)
                    .catch((err) => {
                        throw new Error(`Error setting water to ${body.closed}.`);
                    })

            return {
                closed: result
            };
        }

        /**
         * turn ECO on/off for all thermostats in a home
         */
        async function ecoThermostats(context) {
            const body = context.body;
            const params = context.params;
            const session = context.session;

            console.log("got body: ", body);

            const id = params.id;
            console.log("got id: ", id);

            const user = session.user;

            await initDevices(context);

            const home = await getHome(user.homes, id);

            const result =
                await devices.ecoThermostats(home, body.eco)
                    .catch((err) => {
                        throw new Error('Error setting Eco mode on thermostats.');
                    })

            return {
                eco: result
            };
        }

        /**
         * open or close an individual garage door
         */
        async function toggleGarage(context) {
            const body = context.body;
            const params = context.params;

            console.log("got body: ", body);

            const id = params.id;
            console.log("got id: ", id);

            await initDevices(context);

            const garages = devices.getGarages();

            const result =
                await garages.open(id, body.open)
                    .catch((err) => {
                        throw new Error('Error setting garage state.');
                    });

            return {
                open: result
            };
        }

        /**
         * turn ECO on/off for an individual thermostat
         */
        async function ecoThermostat(context) {
            const body = context.body;
            const params = context.params;

            console.log("got body: ", body);

            const id = params.id;
            console.log("got id: ", id);

            await initDevices(context);

            const thermostats = devices.getThermostats();

            const result = await thermostats.setEco(id, body.eco)
                .catch((err) => {
                    throw new Error('Error setting Eco on thermostat.');
                });

            return {
                eco: result
            };
        }

        /**
         * turn mode to HEAT, COOL or OFF for an individual thermostat
         */
        async function modeThermostat(context) {
            const body = context.body;
            const params = context.params;

            console.log("got body: ", body);

            const id = params.id;
            console.log("got id: ", id);

            await initDevices(context);

            const thermostats = devices.getThermostats();

            const result = await thermostats.setMode(id, body.mode)
                .catch((err) => {
                    throw new Error('Error setting thermostat mode.');
                });

            return {
                mode: result
            };
        }

        /**
         * set the target temp
         */
        async function tempThermostat(context) {
            const body = context.body;
            const params = context.params;

            console.log("got body: ", body);

            const id = params.id;
            console.log("got id: ", id);

            await initDevices(context);

            const thermostats = devices.getThermostats();

            await thermostats.setTemp(id, body.mode, body.temp)
                .catch((err) => {
                    throw new Error('Error setting thermostat temp.');
                });

            return {
                mode: body.mode,
                temp: body.temp
            };
        }

        server.method('/api/users/login', 'POST', login);
        server.method('/api/users/logout', 'POST', logout);

        server.method('/api/homes', 'GET', homes, auth);
        server.method('/api/homes/:id/systems/camera/arm', 'POST', toggleCameras, auth);
        server.method('/api/homes/:id/systems/locks/lock', 'POST', toggleDoors, auth);
        server.method('/api/homes/:id/systems/watervalves/close', 'POST', toggleWater, auth);
        server.method('/api/homes/:id/systems/thermostat/eco', 'POST', ecoThermostats, auth);

        server.method('/api/garages/:id/open', 'POST', toggleGarage, auth);
        server.method('/api/thermostats/:id/eco', 'POST', ecoThermostat, auth);
        server.method('/api/thermostats/:id/mode', 'POST', modeThermostat, auth);
        server.method('/api/thermostats/:id/temp', 'POST', tempThermostat, auth);

        // start the server on the specified port
        server.listen(port);
    }
}

module.exports = ApiServer;