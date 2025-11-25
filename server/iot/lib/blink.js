/**
 * wrapper for Blink API
 */

const BlinkModule = require("node-blink-security");
const fs = require("fs");

const Blink = function (credentialsFile) {
  this.init = async function () {
    const credsData = fs.readFileSync(credentialsFile, "utf-8");
    const creds = JSON.parse(credsData);

    const blinkAuth = new BlinkModule.BlinkAuth(
      creds,
      true,
      (callback = () => {
        // callback when tokens are refreshed
        const loginAttributes = blinkAuth.getLoginAttributes();
        console.log("refreshed tokens", loginAttributes);

        const jsonString = JSON.stringify(loginAttributes, null, 2);
        fs.writeFile(credentialsFile, jsonString, (err) => {
          if (err) {
            console.error("Error writing JSON file:", err);
          } else {
            console.log("JSON data successfully written to creds.json");
          }
        });
      })
    );

    const blink = new BlinkModule.Blink(blinkAuth);
    return blink;
  };
};

module.exports = Blink;
