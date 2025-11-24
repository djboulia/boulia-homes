import axios from "axios";

import Session from "./Session";

/**
 * Wrapper for back end server calls
 */

const basePath = function () {
  return "/api";
};

/**
 * if REACT_APP_API_URL is set, we send back end requests to that, otherwise
 * we default to the same host that served up the client
 * useful for dev mode where the server might be hosted on a different url
 */
const baseUrl = function () {
  const url = process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL
    : "";

  return url + basePath();
};

const buildPath = function (path) {
  const result = baseUrl() + path;

  console.log("buildPath: " + result);

  return result;
};

console.log("baseUrl: ", baseUrl());

const request = axios.create({
  baseURL: baseUrl(),
  withCredentials: true,
});

const ServerApi = {
  getLoginUrl() {
    return baseUrl() + "/users/login";
  },

  isLoggedIn() {
    console.log("isLoggedIn returning: " + (Session.getToken() !== undefined));
    return Session.getToken() !== undefined;
  },

  getUser() {
    const user = Session.getUser();

    console.log("returning user " + JSON.stringify(user));
    return user;
  },

  login(userid, password) {
    // new login, remove any existing token
    Session.reset();

    return new Promise((resolve, reject) => {
      request
        .post("/users/login", {
          userid: userid,
          password: password,
        })
        .then((res) => {
          console.log("login: ", res);

          const result = res.data;
          if (!result.error) {
            const user = result.user;

            const name = user.name;
            const token = user.token;
            const admin = user.admin ? true : false;
            const ttl = user.ttl;

            console.log(res.headers);

            Session.create(name, userid, admin, token, ttl);

            resolve(res.data);
          } else {
            const error = result.error;
            console.log("Error: " + error.message);
            reject(error);
          }
        })
        .catch((e) => {
          console.log("error: " + JSON.stringify(e));
          reject({
            code: 500,
            message: e.message,
          });
        });
    });
  },

  logout() {
    const self = this;

    return new Promise((resolve, reject) => {
      request
        .post("/users/logout")
        .then((res) => {
          console.log(res);
          console.log(res.data);

          Session.reset();

          resolve("success");
        })
        .catch((e) => {
          reject({
            code: 500,
            message: e.message,
          });
        });
    });
  },

  homes() {
    return new Promise((resolve, reject) => {
      request
        .get("/homes")
        .then((res) => {
          console.log(res);
          console.log(res.data);

          const result = res.data;
          if (!result.error) {
            resolve(result.homes);
          } else {
            console.log("homes other error: ", result.error);
            reject(result.error);
          }
        })
        .catch((e) => {
          console.log("homes catch error ", e.message);

          let code = 500;
          if (e.message.endsWith("status code 401")) {
            code = 401;
          }

          reject({
            code: code,
            message: e.message,
          });
        });
    });
  },

  armCameraSystem(homeId, arm) {
    return new Promise((resolve, reject) => {
      const path = "/homes/" + homeId + "/systems/camera/arm";
      // console.log('path: ', path);

      request
        .post(path, { arm: arm })
        .then((res) => {
          console.log(res.data);

          const result = res.data;
          if (!result.error) {
            resolve(result);
          } else {
            reject(result.error);
          }
        })
        .catch((e) => {
          console.log("error ", JSON.stringify(e));
          reject({
            code: 500,
            message: e.message,
          });
        });
    });
  },

  setGarageOpen(id, open) {
    return new Promise((resolve, reject) => {
      request
        .post("/garages/" + id + "/open", { open: open })
        .then((res) => {
          console.log(res.data);

          const result = res.data;
          if (!result.error) {
            resolve(result);
          } else {
            reject(result.error);
          }
        })
        .catch((e) => {
          console.log("error ", JSON.stringify(e));
          reject({
            code: 500,
            message: e.message,
          });
        });
    });
  },

  setThermostatEco(id, eco) {
    return new Promise((resolve, reject) => {
      request
        .post("/thermostats/" + id + "/eco", { eco: eco })
        .then((res) => {
          console.log(res.data);

          const result = res.data;
          if (!result.error) {
            resolve(result);
          } else {
            reject(result.error);
          }
        })
        .catch((e) => {
          console.log("error ", JSON.stringify(e));
          reject({
            code: 500,
            message: e.message,
          });
        });
    });
  },

  setThermostatMode(id, mode) {
    return new Promise((resolve, reject) => {
      request
        .post("/thermostats/" + id + "/mode", { mode: mode })
        .then((res) => {
          console.log(res.data);

          const result = res.data;
          if (!result.error) {
            resolve(result);
          } else {
            reject(result.error);
          }
        })
        .catch((e) => {
          console.log("error ", JSON.stringify(e));
          reject({
            code: 500,
            message: e.message,
          });
        });
    });
  },

  setThermostatTemp(id, mode, temp) {
    return new Promise((resolve, reject) => {
      request
        .post("/thermostats/" + id + "/temp", { mode: mode, temp: temp })
        .then((res) => {
          console.log(res.data);

          const result = res.data;
          if (!result.error) {
            resolve(result);
          } else {
            reject(result.error);
          }
        })
        .catch((e) => {
          console.log("error ", JSON.stringify(e));
          reject({
            code: 500,
            message: e.message,
          });
        });
    });
  },

  ecoThermostatSystem(homeId, eco) {
    return new Promise((resolve, reject) => {
      request
        .post("/homes/" + homeId + "/systems/thermostat/eco", { eco: eco })
        .then((res) => {
          console.log(res.data);

          const result = res.data;
          if (!result.error) {
            resolve(result);
          } else {
            reject(result.error);
          }
        })
        .catch((e) => {
          console.log("error ", JSON.stringify(e));
          reject({
            code: 500,
            message: e.message,
          });
        });
    });
  },

  lockSystem(homeId, locked) {
    return new Promise((resolve, reject) => {
      request
        .post("/homes/" + homeId + "/systems/locks/lock", { locked: locked })
        .then((res) => {
          console.log(res.data);

          const result = res.data;
          if (!result.error) {
            resolve(result);
          } else {
            reject(result.error);
          }
        })
        .catch((e) => {
          console.log("error ", JSON.stringify(e));
          reject({
            code: 500,
            message: e.message,
          });
        });
    });
  },

  closeWaterValves(homeId, closed) {
    return new Promise((resolve, reject) => {
      request
        .post("/homes/" + homeId + "/systems/watervalves/close", {
          closed: closed,
        })
        .then((res) => {
          console.log(res.data);

          const result = res.data;
          if (!result.error) {
            resolve(result);
          } else {
            reject(result.error);
          }
        })
        .catch((e) => {
          console.log("error ", JSON.stringify(e));
          reject({
            code: 500,
            message: e.message,
          });
        });
    });
  },

  setLock(id, type, locked) {
    return new Promise((resolve, reject) => {
      request
        .post("/locks/" + id + "/locked", { type: type, locked: locked })
        .then((res) => {
          console.log(res.data);

          const result = res.data;
          if (!result.error) {
            resolve(result);
          } else {
            reject(result.error);
          }
        })
        .catch((e) => {
          console.log("error ", JSON.stringify(e));
          reject({
            code: 500,
            message: e.message,
          });
        });
    });
  },
};

export default ServerApi;
