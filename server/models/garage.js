const Config = require('../config');
const Devices = require('../iot/devices');
const devices = new Devices(Config);

const Garage = function (model) {
    async function initDevices() {
        await devices.init()
            .catch((err) => {
                throw new Error('Error initializing devices.');
            });
    }

    /**
     * open or close an individual garage door
     */
     model.toggleGarage = async function(id, body) {

        console.log("got body: ", body);
        console.log("got id: ", id);

        const open = body.open;

        await initDevices();

        const garages = devices.getGarages();

        const result =
            await garages.open(id, open)
                .catch((err) => {
                    throw new Error('Error setting garage state.');
                });

        return {
            open: result
        };
    }

    // add our additional entry points here
    // order is important since this is how the methods will be displayed
    // in the API explorer, so we add the login method first

    model.method(
        '/:id/open',
        'POST',
        {
            description: "Open or close the garage",
            responses: [
                {
                    code: 200,
                    description: "Garage opend or closed"
                },
                {
                    code: 500,
                    description: "Error accessing garage"
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
                        "name": 'garage-command',
                        "properties": {
                            "open": {
                                "required": true,
                                "type": 'boolean'
                            }
                        }
                    }
                }
            ]
        },
        model.toggleGarage
    );
};

module.exports = Garage;