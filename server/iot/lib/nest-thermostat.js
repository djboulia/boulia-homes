const axios = require('axios');

const TRAIT_ECO = "sdm.devices.traits.ThermostatEco";
const TRAIT_TEMP = "sdm.devices.traits.Temperature";
const TRAIT_HVAC = "sdm.devices.traits.ThermostatHvac";
const TRAIT_MODE = "sdm.devices.traits.ThermostatMode";
const TRAIT_SET_POINT = "sdm.devices.traits.ThermostatTemperatureSetpoint";

const KEY_TEMP_AMBIENT = "ambientTemperatureCelsius";

const CMD_ECO = "sdm.devices.commands.ThermostatEco.SetMode";
const CMD_HEAT = "sdm.devices.commands.ThermostatTemperatureSetpoint.SetHeat";
const CMD_COOL = "sdm.devices.commands.ThermostatTemperatureSetpoint.SetCool";

const PARAM_MODE = "mode";
const PARAM_HEAT = "heatCelsius";
const PARAM_COOL = "coolCelsius";

const VAL_MANUAL_ECO = "MANUAL_ECO";
const VAL_OFF = "OFF";

const toFahrenheit = function (tempInC) {
    return (tempInC * 1.8) + 32;
}

const toCelsius = function (tempInF) {
    return (tempInF - 32) * 5/9;
}

const NestThermostat = function (nest, deviceId, deviceInfo) {
    this.isEcoMode = function () {
        // console.log('eco ', deviceInfo.traits[TRAIT_ECO]);

        return deviceInfo.traits[TRAIT_ECO].mode === VAL_MANUAL_ECO;
    }

    this.getTemperature = function () {
        // console.log('device info ', deviceInfo);

        const temp = deviceInfo.traits[TRAIT_TEMP];
        return toFahrenheit(temp[KEY_TEMP_AMBIENT]);
    }

    this.getHvacStatus = function () {
        // console.log('device info ', deviceInfo);

        const val = deviceInfo.traits[TRAIT_HVAC].status;
        return val;
    }

    this.getMode = function () {
        // console.log('device info ', deviceInfo);

        const val = deviceInfo.traits[TRAIT_MODE];
        return val.mode;
    }

    this.getAvailableModes = function () {
        // console.log('device info ', deviceInfo);

        const val = deviceInfo.traits[TRAIT_MODE];
        return val.availableModes;
    }

    this.setHeat = function (temp) {
        const self = this;

        const tempCelsius = toCelsius(temp);
        console.log('temp ' + temp + ', celsius=', tempCelsius);

        return new Promise((resolve, reject) => {

            const params = {};
            params[PARAM_HEAT] = tempCelsius;

            nest.command(deviceId, CMD_HEAT, params)
                .then((res) => {
                    const result = res.data;

                    console.log('result: ', result);
                    deviceInfo.traits[TRAIT_SET_POINT] = { PARAM_HEAT : temp };

                    resolve(self);
                })
                .catch((e) => {
                    reject(e);
                })
        })
    }

    this.setCool = function (temp) {
        const self = this;

        const tempCelsius = toCelsius(temp);
        console.log('temp ' + temp + ', celsius=', tempCelsius);

        return new Promise((resolve, reject) => {

            const params = {};
            params[PARAM_COOL] = tempCelsius;

            nest.command(deviceId, CMD_COOL, params)
                .then((res) => {
                    const result = res.data;

                    console.log('result: ', result);
                    deviceInfo.traits[TRAIT_SET_POINT] = { PARAM_COOL : temp };

                    resolve(self);
                })
                .catch((e) => {
                    reject(e);
                })
        })
    }

    this.setEcoMode = function (on) {
        const self = this;

        return new Promise((resolve, reject) => {

            const params = {};
            params[PARAM_MODE] = (on) ? VAL_MANUAL_ECO : VAL_OFF;

            nest.command(deviceId, CMD_ECO, params)
                .then((res) => {
                    const result = res.data;

                    console.log('eco result: ', result);

                    // update our internal status
                    deviceInfo.traits[TRAIT_ECO] = (on) ? VAL_MANUAL_ECO : VAL_OFF;
                    resolve(self);
                })
                .catch((e) => {
                    reject(e);
                })
        })
    }
}

module.exports = NestThermostat;