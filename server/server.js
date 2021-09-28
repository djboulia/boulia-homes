/**
 * Backend for the home automation app
 *
 */

var express = require('express'); // Express web server framework
var cors = require('cors')
var path = require('path');
var session = require("express-session");
const bodyParser = require('body-parser');

const Devices = require('./iot/devices');
const Camera = require('./iot/camera');
const Lock = require('./iot/lock');
const Garage = require('./iot/garage');
const Thermostat = require('./iot/thermostat');

require("dotenv").config();

const Config = require('./config');
const Users = Config.loadModel('user');
const Homes = Config.loadModel('home');
const Blink = Config.loadBlink();
const Nest = Config.loadNest();
const SmartThings = Config.loadSmartThings();
const Meross = Config.loadMeross();

const camera = new Camera(Blink);
const thermostat = new Thermostat(Nest);
const lock = new Lock(SmartThings);
const garage = new Garage(Meross);
const devices = new Devices(camera, thermostat, lock, garage);

const app = express();

app.use(cors())

app.use(express.static(path.join(__dirname, '..', 'client')))
    .use(bodyParser.json());

app.use(
    session({
        secret: "keyboard cat",
        resave: true,
        saveUninitialized: true
    })
);

const jsonResponse = function (res, obj) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(obj));
}

const jsonError = function (res, code, message) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
        error: {
            code: code,
            message: message
        }
    }));
}

app.post('/api/login', function (req, res) {
    console.log("got body: ", req.body);

    // login attempt resets session data
    req.session.user = undefined;

    // for now, just return a positive response if there is any user/pass given
    const body = req.body;
    const userid = (body) ? body.userid : undefined;
    const password = (body) ? body.password : undefined;

    Users.authenticate(userid, password)
        .then((result) => {
            req.session.user = result;

            jsonResponse(res, {
                user: result
            });
        })
        .catch((err) => {
            jsonError(res, 401, err);
        })
});

app.post('/api/logout', function (req, res) {
    console.log("logout ");

    req.session.user = undefined;

    jsonResponse(res, {
        message: 'Logged out.'
    });
});

/**
 * get homes for the current user
 */
app.get('/api/user/me/homes', function (req, res) {

    const user = req.session.user;

    if (!user) {
        jsonError(res, 401, 'Please log in.');
        return;
    }

    devices.init()
        .then(() => {
            return Homes.getIds(user.homes)
        })
        .then((result) => {
            // get current status for all devices
            const promises = [];

            for (let i = 0; i < result.length; i++) {
                const home = result[i];

                promises.push(devices.updateHomeStatus(home));
            }

            Promise.all(promises)
                .then((results) => {
                    jsonResponse(res, {
                        homes: results
                    });
                })
                .catch((e) => {
                    console.log('error: ', e);
                    jsonError(res, 404, 'Error updating home status.');
                })
        })
        .catch((e) => {
            jsonError(res, 404, 'Error retrieving homes.');
        })
});

app.post('/api/user/me/homes/:id/systems/camera/arm', function (req, res) {
    console.log("got body: ", req.body);
    const id = req.params.id;

    const user = req.session.user;

    if (!user) {
        jsonError(res, 401, 'Please log in.');
        return;
    }

    const body = req.body;

    devices.init()
        .then(() => {
            return Homes.getIds(user.homes)
        })
        .then((result) => {
            // get current status for all devices
            let promise = undefined;

            for (let i = 0; i < result.length; i++) {
                const home = result[i];

                if (home._id === id) {
                    promise = devices.armCameras(home, body.arm);
                    break;
                }
            }

            if (!promise) {
                jsonError(res, 404, 'Home id ' + id + ' not found.');
                return;
            }

            promise
                .then((result) => {
                    jsonResponse(res, {
                        armed: result
                    });
                })
                .catch((e) => {
                    console.log('error: ', e);
                    jsonError(res, 404, 'Error arming cameras.');
                })
        })
        .catch((e) => {
            console.log('error: ', e);
            jsonError(res, 404, 'Error retrieving homes.');
        })
});

/**
 * open or close an individual garage door
 */
 app.post('/api/user/me/garages/:id/open', function (req, res) {
    console.log("got body: ", req.body);
    const id = req.params.id;
    console.log("got id: ", id);

    const user = req.session.user;

    if (!user) {
        jsonError(res, 401, 'Please log in.');
        return;
    }

    const body = req.body;

    devices.init()
        .then(() => {
            const garages = devices.getGarages();

            garages.open(id, body.open)
                .then((result) => {
                    jsonResponse(res, {
                        open: result
                    });
                })
                .catch((e) => {
                    console.log('error: ', e);
                    jsonError(res, 404, 'Error arming cameras.');
                })
        })
        .catch((e) => {
            console.log('error: ', e);
            jsonError(res, 404, 'Error retrieving homes.');
        })
});


/**
 * turn ECO on/off for all thermostats in a home
 */
app.post('/api/user/me/homes/:id/systems/thermostat/eco', function (req, res) {
    console.log("got body: ", req.body);
    const id = req.params.id;
    console.log("got id: ", id);

    const user = req.session.user;

    if (!user) {
        jsonError(res, 401, 'Please log in.');
        return;
    }

    const body = req.body;

    devices.init()
        .then(() => {
            return Homes.getIds(user.homes)
        })
        .then((result) => {
            // get current status for all devices
            let promise = undefined;

            for (let i = 0; i < result.length; i++) {
                const home = result[i];

                if (home._id === id) {
                    promise = devices.ecoThermostats(home, body.eco);
                    break;
                }
            }

            if (!promise) {
                jsonError(res, 404, 'Home id ' + id + ' not found.');
                return;
            }

            promise
                .then((result) => {
                    jsonResponse(res, {
                        eco: result
                    });
                })
                .catch((e) => {
                    console.log('error: ', e);
                    jsonError(res, 404, 'Error arming cameras.');
                })
        })
        .catch((e) => {
            console.log('error: ', e);
            jsonError(res, 404, 'Error retrieving homes.');
        })
});

/**
 * turn ECO on/off for an individual thermostat
 */
app.post('/api/user/me/thermostats/:id/eco', function (req, res) {
    console.log("got body: ", req.body);
    const id = req.params.id;
    console.log("got id: ", id);

    const user = req.session.user;

    if (!user) {
        jsonError(res, 401, 'Please log in.');
        return;
    }

    const body = req.body;

    devices.init()
        .then(() => {
            const thermostats = devices.getThermostats();

            thermostats.setEco(id, body.eco)
                .then((result) => {
                    jsonResponse(res, {
                        eco: result
                    });
                })
                .catch((e) => {
                    console.log('error: ', e);
                    jsonError(res, 404, 'Error arming cameras.');
                })
        })
        .catch((e) => {
            console.log('error: ', e);
            jsonError(res, 404, 'Error retrieving homes.');
        })
});

/**
 * turn mode to HEAT, COOL or OFF for an individual thermostat
 */
app.post('/api/user/me/thermostats/:id/mode', function (req, res) {
    console.log("got body: ", req.body);
    const id = req.params.id;
    console.log("got id: ", id);

    const user = req.session.user;

    if (!user) {
        jsonError(res, 401, 'Please log in.');
        return;
    }

    const body = req.body;

    devices.init()
        .then(() => {
            const thermostats = devices.getThermostats();

            thermostats.setMode(id, body.mode)
                .then((result) => {
                    jsonResponse(res, {
                        mode: result
                    });
                })
                .catch((e) => {
                    console.log('error: ', e);
                    jsonError(res, 404, 'Error arming cameras.');
                })
        })
        .catch((e) => {
            console.log('error: ', e);
            jsonError(res, 404, 'Error retrieving homes.');
        })
});

/**
 * set the target temp
 */
app.post('/api/user/me/thermostats/:id/temp', function (req, res) {
    console.log("got body: ", req.body);
    const id = req.params.id;
    console.log("got id: ", id);

    const user = req.session.user;

    if (!user) {
        jsonError(res, 401, 'Please log in.');
        return;
    }

    const body = req.body;

    devices.init()
        .then(() => {
            const thermostats = devices.getThermostats();

            thermostats.setTemp(id, body.mode, body.temp)
                .then((result) => {
                    jsonResponse(res, {
                        mode: body.mode,
                        temp: body.temp
                    });
                })
                .catch((e) => {
                    console.log('error: ', e);
                    jsonError(res, 404, 'Error arming cameras.');
                })
        })
        .catch((e) => {
            console.log('error: ', e);
            jsonError(res, 404, 'Error retrieving homes.');
        })
});

app.post('/api/user/me/homes/:id/systems/locks/lock', function (req, res) {
    console.log("got body: ", req.body);
    const id = req.params.id;

    const user = req.session.user;

    if (!user) {
        jsonError(res, 401, 'Please log in.');
        return;
    }

    const body = req.body;

    devices.init()
        .then(() => {
            return Homes.getIds(user.homes)
        })
        .then((result) => {
            // get current status for all devices
            let promise = undefined;

            for (let i = 0; i < result.length; i++) {
                const home = result[i];

                if (home._id === id) {
                    promise = devices.lockHome(home, body.locked);
                    break;
                }
            }

            if (!promise) {
                jsonError(res, 404, 'Home id ' + id + ' not found.');
                return;
            }

            promise
                .then((result) => {
                    jsonResponse(res, {
                        locked: result
                    });
                })
                .catch((e) => {
                    console.log('error: ', e);
                    jsonError(res, 404, 'Error arming cameras.');
                })
        })
        .catch((e) => {
            console.log('error: ', e);
            jsonError(res, 404, 'Error retrieving homes.');
        })
});

// catch all other non-API calls and redirect back to our REACT app
app.get('/*', function (req, res) {
    const defaultFile = path.join(__dirname, '..', 'client', 'index.html');
    res.sendFile(defaultFile);
});

console.log('Listening on 8888');
app.listen(process.env.PORT || 8888);