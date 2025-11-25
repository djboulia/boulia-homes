const Config = require("../config");
const Devices = require("../iot/devices");
const devices = new Devices(Config);

const Lock = function (model) {
  async function initDevices() {
    await devices.init().catch((err) => {
      throw new Error("Error initializing devices.");
    });
  }

  /**
   * open or close an individual lock
   */
  model.toggleLock = async function (id, body) {
    console.log("got body: ", body);
    console.log("got id: ", id);

    const locked = body.locked;
    const type = body.type;

    await initDevices();

    const lockSmartThings = devices.getLockSmartThings();
    const lockKwiksetHalo = devices.getLockKwiksetHalo();

    let result;
    if (type === "smartthings") {
      console.log("setting smartthings lock ", id, locked);
      result = await lockSmartThings.set(id, locked).catch((err) => {
        throw new Error("Error setting smartthings lock state for " + id + ".");
      });
    } else if (type === "kwikset-halo") {
      console.log("setting kwikset-halo lock ", id, locked);
      result = await lockKwiksetHalo.set(id, locked).catch((err) => {
        throw new Error(
          "Error setting kwikset-halo lock state for " + id + "."
        );
      });
    } else {
      throw new Error("Unsupported lock type.");
    }

    return {
      locked: result,
    };
  };

  // add our additional entry points here
  // order is important since this is how the methods will be displayed
  // in the API explorer, so we add the login method first

  model.method(
    "/:id/locked",
    "POST",
    {
      description: "Lock or unlock the lock",
      responses: [
        {
          code: 200,
          description: "Lock locked or unlocked",
        },
        {
          code: 500,
          description: "Error accessing lock",
        },
      ],
      params: [
        {
          name: "id",
          source: "param",
          type: "string",
        },
        {
          name: "command",
          source: "body",
          type: "object",
          schema: {
            name: "lock-command",
            properties: {
              type: {
                required: true,
                type: "string",
              },
              locked: {
                required: true,
                type: "boolean",
              },
            },
          },
        },
      ],
    },
    model.toggleLock
  );
};

module.exports = Lock;
