const HaloLock = function (halo, deviceId, deviceInfo) {
  this.isLocked = function () {
    console.log("halo lock status ", deviceInfo.doorstatus);

    const lockStatus = deviceInfo.doorstatus;
    const isLocked = lockStatus === "Locked";

    console.log("halo isLocked returning ", isLocked);

    return isLocked;
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
