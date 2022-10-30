/**
 * 
 * Backend API for the home automation app
 *
 */

const app = require('@apiserver/modelserver');
const Config = require('./config');
const Models = require('./models');

const ApiServer = function (clientDir) {

    const BASE_URL = '/api';
    const protocols = (process.env.SWAGGER_PROTOCOL) ? [process.env.SWAGGER_PROTOCOL] : undefined;
    const corsSites = (process.env.CORS_CLIENT) ? [process.env.CORS_CLIENT] : undefined;

    this.start = function (port) {
        console.log('corsSites: ', corsSites);
        
        app.path(BASE_URL, clientDir, corsSites);

        app.explorer("Homes", '/explorer', protocols);

        console.log('adding models...');
        Models.addModels(Config, app);

        /**
         * called to validate the user is authorized
         * to call the given API
         * 
         * @param {*} context 
         */
        app.auth(async function (context) {
            console.log('auth called');

            const session = context.session;
            const user = Models.getUser(app);

            const result =  await user.currentUser(session);
            
            return result != undefined;
        });

        // start the server on the specified port
        app.listen(port);
    }
}

module.exports = ApiServer;