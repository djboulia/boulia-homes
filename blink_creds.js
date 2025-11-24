/* this will create a creds.json file with Blink login tokens */
const { Blink, BlinkAuth } = require("node-blink-security");
const fs = require("fs");

// this will prompt for username, password and 2FA code after login
const blinkAuth = new BlinkAuth();
const blink = new Blink(blinkAuth);

blink.setupSystem("Cary Outside").then(
  () => {
    // save login creds for next time
    const loginAttributes = blinkAuth.getLoginAttributes();
    console.log("new tokens", loginAttributes);

    const jsonString = JSON.stringify(loginAttributes, null, 2);
    fs.writeFile("creds.json", jsonString, (err) => {
      if (err) {
        console.error("Error writing JSON file:", err);
      } else {
        console.log("JSON data successfully written to creds.json");
      }
    });
  },
  (error) => {
    console.log(error);
  }
);
