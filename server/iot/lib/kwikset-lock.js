const HaloLock = function (halo, deviceId, deviceInfo) {
  this.getLockState = function () {
    console.log("halo lock status ", deviceInfo.doorstatus);

    const lockState = deviceInfo?.doorstatus
      ? deviceInfo.doorstatus.toUpperCase()
      : "UNKNOWN";

    console.log("halo getLockState returning ", lockState);

    return lockState;
  };

  this.lock = async function () {
    const result = await halo.setLockState(deviceId, true).catch((e) => {
      console.error("halo lock error ", e);
      throw e;
    });
    console.log("halo lock result ", result);

    // update the device status
    deviceInfo.doorstatus = "Locked";
    return result;
  };

  this.unlock = async function () {
    const result = await halo.setLockState(deviceId, false).catch((e) => {
      console.error("halo unlock error ", e);
      throw e;
    });
    console.log("halo lock result ", result);

    // update the device status
    deviceInfo.doorstatus = "Unlocked";
    return result;
  };
};

module.exports = HaloLock;
