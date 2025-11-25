import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import { LinearProgress } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import Toggle from "./components/Toggle";
import CardHeader from "./components/CardHeader";
import Grid from "@material-ui/core/Grid";
import ServerApi from "../server/ServerApi";
import LockGroup from "./LockGroup";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  title: {
    fontSize: 14,
  },
}));

const camerasArmed = function (cameras) {
  let armed = true;

  for (let i = 0; i < cameras.length; i++) {
    const camera = cameras[i];
    if (camera.status) {
      if (!camera.status.armed) {
        armed = false;
      }
    } else {
      // no status for this camera, assume it's disarmed
      armed = false;
    }
  }

  return armed;
};

const updateCamerasStatus = function (cameras, armed) {
  for (let i = 0; i < cameras.length; i++) {
    const camera = cameras[i];
    if (camera.status) {
      camera.status.armed = armed;
    }
  }

  return armed;
};

const thermostatsEco = function (thermostats) {
  let away = true;

  for (let i = 0; i < thermostats.length; i++) {
    const thermostat = thermostats[i];
    if (thermostat.status) {
      // if any of the thermostats are out of ECO mode
      // then we assume the system is not in 'away' mode
      if (!thermostat.status.eco) {
        away = false;
      }
    } else {
      // no status for this device, assume it's home
      away = false;
    }
  }

  return away;
};

const updateThermostatsStatus = function (thermostats, away) {
  for (let i = 0; i < thermostats.length; i++) {
    const thermostat = thermostats[i];
    if (thermostat.status) {
      thermostat.status.eco = away;
    }
  }

  return away;
};

const lockStatus = function (locks) {
  let locked = true;

  for (let i = 0; i < locks.length; i++) {
    const lock = locks[i];
    console.log("lock: ", lock);
    if (lock.status) {
      // if any of the locks are unlocked, we reflect the system as unlocked
      if (!lock.status.lockState === "LOCKED") {
        locked = false;
      }
    } else {
      locked = false;
    }
  }

  return locked;
};

const waterStatus = function (watervalves) {
  let closed = true;

  for (let i = 0; i < watervalves.length; i++) {
    const valve = watervalves[i];
    if (valve.status) {
      // if any of the valves are open, we reflect the system as open
      if (valve.status.open) {
        closed = false;
      }
    } else {
      closed = false;
    }
  }

  return closed;
};

const updateLocksStatus = function (locks, locked) {
  for (let i = 0; i < locks.length; i++) {
    const lock = locks[i];
    if (lock.status) {
      // if any of the locks are unlocked, we reflect the system as unlocked
      lock.status.lockState = locked ? "LOCKED" : "UNLOCKED";
    }
  }

  return locked;
};

const updateWaterStatus = function (watervalves, closed) {
  for (let i = 0; i < watervalves.length; i++) {
    const valve = watervalves[i];
    if (valve.status) {
      valve.status.open = !closed;
    }
  }

  return closed;
};

export default function System(props) {
  const classes = useStyles();
  const homeId = props.id;
  const name = props.name;
  const systems = props.systems;
  console.log("systems ", systems);

  const [inProgress, setInProgress] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState(undefined);
  const [armed, setArmed] = React.useState(camerasArmed(systems.cameras));
  const [away, setAway] = React.useState(thermostatsEco(systems.thermostats));
  const [locked, setLocked] = React.useState(
    systems.locks ? lockStatus(systems.locks) : undefined
  );
  const [garages, setGarages] = React.useState(
    systems.garages ? systems.garages : undefined
  );
  const [waterClosed, setWaterClosed] = React.useState(
    systems.watervalves ? waterStatus(systems.watervalves) : undefined
  );

  const errorAlert = (msg) => {
    return <Alert severity="error">{msg}</Alert>;
  };

  const cameraChanged = function (e) {
    console.log("camera changed ", e);
    const status = e.checked;
    setInProgress(true);

    ServerApi.armCameraSystem(homeId, e.checked)
      .then((result) => {
        console.log("new state is: ", result);
        setErrorMsg(undefined);
        setArmed(updateCamerasStatus(systems.cameras, result.armed));
        setInProgress(false);
      })
      .catch((e) => {
        console.log("error! setting cameras back to " + !status);
        setErrorMsg("Failed to change cameras setting");
        setArmed(!status);
        setInProgress(false);
      });
  };

  const thermostatChanged = function (e) {
    console.log("thermostat changed ", e);
    const status = e.checked;
    setInProgress(true);

    ServerApi.ecoThermostatSystem(homeId, e.checked)
      .then((result) => {
        console.log("new state is: ", result);
        setErrorMsg(undefined);
        setAway(updateThermostatsStatus(systems.thermostats, result.eco));
        setInProgress(false);
      })
      .catch((e) => {
        console.log("error! setting thermostat back to " + !status);
        setErrorMsg("Failed to change thermostat setting");
        setAway(!status);
        setInProgress(false);
      });
  };

  const lockChanged = function (e) {
    console.log("lock changed ", e);
    const status = e.checked;
    setInProgress(true);

    ServerApi.lockSystem(homeId, e.checked)
      .then((result) => {
        console.log("new state is: ", result);
        setErrorMsg(undefined);
        setLocked(updateLocksStatus(systems.locks, result.locked));
        setInProgress(false);
      })
      .catch((e) => {
        console.log("error! setting lock back to " + !status);
        setErrorMsg("Failed to change lock setting");
        setLocked(!status);
        setInProgress(false);
      });
  };

  const valveChanged = function (e) {
    console.log("valve changed ", e);
    const status = e.checked;
    setInProgress(true);

    ServerApi.closeWaterValves(homeId, e.checked)
      .then((result) => {
        console.log("new state is: ", result);
        setErrorMsg(undefined);
        setWaterClosed(updateWaterStatus(systems.watervalves, result.closed));
        setInProgress(false);
      })
      .catch((e) => {
        console.log("error! setting water back to " + !status);
        console.log("error! ", e);
        setErrorMsg("Failed to change water setting");
        setLocked(!status);
        setInProgress(false);
      });
  };

  const garageChanged = function (e) {
    console.log("garage changed ", e);
    const id = e.id;
    const status = e.checked;

    const update = [];
    for (let i = 0; i < garages.length; i++) {
      const garage = garages[i];

      if (garage.id === id) {
        console.log("updating garage " + id);

        setInProgress(true);

        ServerApi.setGarageOpen(id, status ? 0 : 1)
          .then((result) => {
            console.log("new state is: ", result.open);
            setErrorMsg(undefined);
            garage.status.open = result.open;
            setInProgress(false);
          })
          .catch((e) => {
            console.log("error! setting garage back to " + !status);
            setErrorMsg("Failed to change garage setting");
            garage.status.open = !status;
            setInProgress(false);
          });
      }

      update.push(garage);
    }

    setGarages(update);
  };

  const progressIndicator = function () {
    return <LinearProgress></LinearProgress>;
  };

  console.log("systems.locks ", systems.locks);

  console.log("systems.watervalves ", systems.watervalves);

  const valveWidget = function () {
    return (
      <Typography className={classes.title} gutterBottom>
        <Toggle
          name="Water"
          checked={waterClosed}
          onlabel="Off"
          offlabel="On"
          onChange={valveChanged}
        />
      </Typography>
    );
  };

  console.log("systems.garages ", systems.garages);

  const garageWidget = function () {
    return (
      <Grid item xs={12} key={"garages"}>
        <Card className={classes.root}>
          <CardContent>
            <CardHeader>Garages</CardHeader>
            <Typography className={classes.title} gutterBottom>
              {garages.map((device, index) => (
                <Toggle
                  key={index}
                  id={device.id}
                  name={device.name}
                  checked={device.status && !device.status.open ? true : false}
                  onlabel="Closed"
                  offlabel="Open"
                  onChange={garageChanged}
                />
              ))}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  const msg = errorMsg ? errorAlert(errorMsg) : <div></div>;

  return (
    <Grid container spacing={1}>
      <Grid item xs={12} key={name}>
        <Card className={classes.root}>
          <CardContent>
            {inProgress && progressIndicator()}

            {!inProgress && msg}

            <CardHeader>System Summary</CardHeader>

            <Typography className={classes.title} gutterBottom>
              <Toggle
                name="Cameras"
                checked={armed}
                onlabel="Armed"
                offlabel="Disarmed"
                onChange={cameraChanged}
              />
            </Typography>
            <Typography className={classes.title} gutterBottom>
              <Toggle
                name="Thermostats"
                checked={away}
                onlabel="Away"
                offlabel="Home"
                onChange={thermostatChanged}
              />
            </Typography>

            <LockGroup locks={systems.locks} onLocksChanged={lockChanged} />

            {systems.watervalves && valveWidget()}
          </CardContent>
        </Card>
      </Grid>

      {systems.garages && garageWidget()}
    </Grid>
  );
}
