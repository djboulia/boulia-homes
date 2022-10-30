const Config = require('../config');
const Devices = require('../iot/devices');
const devices = new Devices(Config);

const Thermostat = function (model) {
    async function initDevices() {
        await devices.init()
            .catch((err) => {
                throw new Error('Error initializing devices.');
            });
    }

    /**
     * turn ECO on/off for an individual thermostat
     */
    model.ecoThermostat = async function(id, body) {

        console.log("got body: ", body);
        console.log("got id: ", id);

        const eco = body.eco;

        await initDevices();

        const thermostats = devices.getThermostats();

        const result = await thermostats.setEco(id, eco)
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
    model.modeThermostat = async function(id, body) {

        console.log("got body: ", body);
        console.log("got id: ", id);

        const mode = body.mode;

        await initDevices();

        const thermostats = devices.getThermostats();

        const result = await thermostats.setMode(id, mode)
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
    model.tempThermostat = async function(id, body) {

        console.log("got body: ", body);
        console.log("got id: ", id);

        const mode = body.mode;
        const temp = body.temp;

        await initDevices();

        const thermostats = devices.getThermostats();

        await thermostats.setTemp(id, mode, temp)
            .catch((err) => {
                throw new Error('Error setting thermostat temp.');
            });

        return {
            mode: body.mode,
            temp: body.temp
        };
    }


    // add our additional entry points here
    // order is important since this is how the methods will be displayed
    // in the API explorer, so we add the login method first

    model.method(
        '/:id/eco',
        'POST',
        {
            description: "Set or unset thermostat to eco",
            responses: [
                {
                    code: 200,
                    description: "Thermostat set or unset to eco"
                },
                {
                    code: 500,
                    description: "Error accessing thermostat"
                }
            ],
            params: [
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
        model.ecoThermostat
    );

    model.method(
        '/:id/mode',
        'POST',
        {
            description: "Set thermostat mode",
            responses: [
                {
                    code: 200,
                    description: "Thermostat mode set"
                },
                {
                    code: 500,
                    description: "Error accessing thermostat"
                }
            ],
            params: [
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
                        "name": 'mode-command',
                        "properties": {
                            "mode": {
                                "required": true,
                                "type": 'string'
                            }
                        }
                    }
                }
            ]
        },
        model.modeThermostat
    );

    model.method(
        '/:id/temp',
        'POST',
        {
            description: "Set thermostat temp",
            responses: [
                {
                    code: 200,
                    description: "Thermostat temp set"
                },
                {
                    code: 500,
                    description: "Error accessing thermostat"
                }
            ],
            params: [
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
                        "name": 'temp-command',
                        "properties": {
                            "mode": {
                                "required": true,
                                "type": 'string'
                            },
                            "temp": {
                                "required": true,
                                "type": 'integer'
                            }
                        }
                    }
                }
            ]
        },
        model.tempThermostat
    );
};

module.exports = Thermostat;