const SmartThingsLock = function (st, deviceId, deviceInfo) {
  this.getLockState = function () {
    console.log("lock ", deviceInfo.components.main.lock.lock);

    const lockStatus = deviceInfo.components.main.lock.lock;
    const lockState = lockStatus.value
      ? lockStatus.value.toUpperCase()
      : "UNKNOWN";

    console.log("lockState returning ", lockState);

    return lockState;
  };

  const executeCommand = function (lock) {
    return new Promise((resolve, reject) => {
      const command = {
        commands: [
          {
            component: "main",
            capability: "lock",
            command: lock ? "lock" : "unlock",
            arguments: [],
          },
        ],
      };

      st.devices
        .executeDeviceCommand(deviceId, command)
        .then((result) => {
          console.log("command result ", result);
          resolve(result);
        })
        .catch((e) => {
          console.error("error ", e);
          reject(e);
        });
    });
  };

  this.lock = function () {
    return executeCommand(true);
  };

  this.unlock = function () {
    return executeCommand(false);
  };
};

module.exports = SmartThingsLock;
