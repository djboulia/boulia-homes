const Config = require('../config');
const Devices = require('../iot/devices');
const devices = new Devices(Config);

const Home = function (model) {
    async function initDevices() {
        await devices.init()
            .catch((err) => {
                throw new Error('Error initializing devices.');
            });
    }

    const findHomeById = function (homes, id) {
        for (let i = 0; i < homes.length; i++) {
            const home = homes[i];

            if (home.id === id) {
                return home;
            }
        }

        return undefined;
    }

    async function getHome(homesList, id) {
        const homes =
            await model.findByIds(homesList)
                .catch((err) => {
                    throw new Error('Error retrieving homes.');
                })

        const home = findHomeById(homes, id);
        if (!home) {
            throw new Error(`Home id ${id} not found.`);
        }

        return home;
    }

    /**
    * get homes for the current user
    */
    model.homes = async function (session) {
        const user = session.user;

        await initDevices();

        const result = await model.findByIds(user.homes);

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

    model.toggleCameras = async function (session, id, body) {

        console.log('got body', body);
        console.log('got id', id);

        const user = session.user;
        const arm = body.arm;

        await initDevices();

        const home = await getHome(user.homes, id);

        const result =
            await devices.armCameras(home, arm)
                .catch((err) => {
                    throw new Error('Error arming cameras.');
                })

        return {
            armed: result
        };
    }

    model.toggleLocks = async function (session, id, body) {


        console.log("got body: ", body);
        console.log("got id: ", id);

        const user = session.user;
        const locked = body.locked;

        await initDevices();

        const home = await getHome(user.homes, id);

        const result =
            await devices.lockHome(home, locked)
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
    model.toggleWater = async function (session, id, body) {

        console.log("got body: ", body);
        console.log("got id: ", id);

        const user = session.user;
        const closed = body.closed;

        await initDevices();

        const home = await getHome(user.homes, id);

        const result =
            await devices.shutOffWater(home, closed)
                .catch((err) => {
                    throw new Error(`Error setting water to ${closed}.`);
                })

        return {
            closed: result
        };
    }

    /**
     * turn ECO on/off for all thermostats in a home
     */
    model.toggleEcoTheromostats = async function (session, id, body) {

        console.log("got body: ", body);
        console.log("got id: ", id);

        const user = session.user;
        const eco = body.eco;

        await initDevices();

        const home = await getHome(user.homes, id);

        const result =
            await devices.ecoThermostats(home, eco)
                .catch((err) => {
                    throw new Error('Error setting Eco mode on thermostats.');
                })

        return {
            eco: result
        };
    }

    // add our additional entry points here
    // order is important since this is how the methods will be displayed
    // in the API explorer, so we add the login method first

    model.method(
        '/',
        'GET',
        {
            description: "Get homes for the current userr",
            responses: [
                {
                    code: 200,
                    description: "Returns the homes"
                },
                {
                    code: 500,
                    description: "Error retrieving homes"
                }
            ],
            params: [
                {
                    name: 'session',
                    source: 'session',
                    type: 'object'
                }
            ]
        },
        model.homes
    );

    model.method(
        '/:id/systems/camera/arm',
        'POST',
        {
            description: "Arm or disarm all cameras for this home",
            responses: [
                {
                    code: 200,
                    description: "Arms or disarms the cameras for this home"
                },
                {
                    code: 500,
                    description: "Error accessing cameras"
                }
            ],
            params: [
                {
                    name: 'session',
                    source: 'session',
                    type: 'object'
                },
                {
                    name: 'id',
                    source: 'param',
                    type: 'string'
                },
                {
                    name: 'command',
                    source: 'body',
                    type: 'object',
                    schema: {
                        "name": 'camera-command',
                        "properties": {
                            "arm": {
                                "required": true,
                                "type": 'boolean'
                            }
                        }
                    }
                }
            ]
        },
        model.toggleCameras
    );

    model.method(
        '/:id/systems/locks/lock',
        'POST',
        {
            description: "Lock or unlock all doors for this home",
            responses: [
                {
                    code: 200,
                    description: "Lock or unlock doors for this home"
                },
                {
                    code: 500,
                    description: "Error accessing locks"
                }
            ],
            params: [
                {
                    name: 'session',
                    source: 'session',
                    type: 'object'
                },
                {
                    name: 'id',
                    source: 'param',
                    type: 'string'
                },
                {
                    name: 'command',
                    source: 'body',
                    type: 'object',
                    schema: {
                        "name": 'lock-command',
                        "properties": {
                            "lock": {
                                "required": true,
                                "type": 'boolean'
                            }
                        }
                    }
                }
            ]
        },
        model.toggleLocks
    );

    model.method(
        '/:id/systems/watervalves/close',
        'POST',
        {
            description: "Turn water on or off for this home",
            responses: [
                {
                    code: 200,
                    description: "Water turned on or off"
                },
                {
                    code: 500,
                    description: "Error accessing water valve"
                }
            ],
            params: [
                {
                    name: 'session',
                    source: 'session',
                    type: 'object'
                },
                {
                    name: 'id',
                    source: 'param',
                    type: 'string'
                },
                {
                    name: 'command',
                    source: 'body',
                    type: 'object',
                    schema: {
                        "name": 'watervalve-command',
                        "properties": {
                            "close": {
                                "required": true,
                                "type": 'boolean'
                            }
                        }
                    }
                }
            ]
        },
        model.toggleWater
    );

    model.method(
        '/:id/systems/thermostat/eco',
        'POST',
        {
            description: "Set thermostats to eco for this honme",
            responses: [
                {
                    code: 200,
                    description: "Thermostats set or unset to eco for this honme"
                },
                {
                    code: 500,
                    description: "Error accessing thermostats"
                }
            ],
            params: [
                {
                    name: 'session',
                    source: 'session',
                    type: 'object'
                },
                {
                    name: 'id',
                    source: 'param',
                    type: 'string'
                },
                {
                    name: 'command',
                    source: 'body',
                    type: 'object',
                    schema: {
                        "name": 'eco-command',
                        "properties": {
                            "eco": {
                                "required": true,
                                "type": 'boolean'
                            }
                        }
                    }
                }
            ]
        },
        model.toggleEcoTheromostats
    );
};

module.exports = Home;