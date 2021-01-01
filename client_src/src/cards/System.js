import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { LinearProgress } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import Toggle from './components/Toggle';
import ServerApi from '../server/ServerApi';

const useStyles = makeStyles({
  root: {
    width: '100%',
  },
  title: {
    fontSize: 14,
  },
});

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
}

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
}

const lockStatus = function (locks) {
  let locked = true;

  for (let i = 0; i < locks.length; i++) {
    const lock = locks[i];
    if (lock.status) {

      // if any of the locks are unlocked, we reflect the system as unlocked
      if (!lock.status.locked) {
        locked = false;
      }
    } else {
      locked = false;
    }
  }

  return locked;
}

export default function System(props) {
  const classes = useStyles();
  const id = props.id;
  const systems = props.systems;
  console.log('systems ', systems);

  const [inProgress, setInProgress] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState(undefined);
  const [armed, setArmed] = React.useState(camerasArmed(systems.cameras));
  const [away, setAway] = React.useState(thermostatsEco(systems.thermostats));
  const [locked, setLocked] = React.useState((systems.locks ? lockStatus(systems.locks) : undefined));

  const errorAlert = (msg) => {
    return <Alert severity="error">{msg}</Alert>
  }

  const cameraChanged = function (e) {
    console.log('camera changed ', e);
    const status = e.checked;
    setInProgress(true);

    ServerApi.armCameraSystem(id, e.checked)
      .then((result) => {
        console.log('new state is: ', result);
        setErrorMsg(undefined);
        setArmed(result.armed);
        setInProgress(false);
      })
      .catch((e) => {
        console.log('error! setting cameras back to ' + !status);
        setErrorMsg('Failed to change cameras setting');
        setArmed(!status);
        setInProgress(false);
      });
  }

  const thermostatChanged = function (e) {
    console.log('thermostat changed ', e);
    const status = e.checked;
    setInProgress(true);

    ServerApi.ecoThermostatSystem(id, e.checked)
      .then((result) => {
        console.log('new state is: ', result);
        setErrorMsg(undefined);
        setAway(result.eco);
        setInProgress(false);
      })
      .catch((e) => {
        console.log('error! setting thermostat back to ' + !status);
        setErrorMsg('Failed to change thermostat setting');
        setAway(!status);
        setInProgress(false);
      });
  }

  const lockChanged = function (e) {
    console.log('lock changed ', e);
    const status = e.checked;
    setInProgress(true);

    ServerApi.lockSystem(id, e.checked)
      .then((result) => {
        console.log('new state is: ', result);
        setErrorMsg(undefined);
        setLocked(result.locked);
        setInProgress(false);
      })
      .catch((e) => {
        console.log('error! setting lock back to ' + !status);
        setErrorMsg('Failed to change lock setting');
        setLocked(!status);
        setInProgress(false);
      });
  }

  const progressIndicator = function () {
    return <LinearProgress></LinearProgress>;
  }

  console.log('systems.locks ', systems.locks);

  const lockWidget = function () {
    return (
        <Typography className={classes.title} gutterBottom>
          <Toggle name='Locks' checked={locked} onlabel='Locked' offlabel='Unlocked' onChange={lockChanged} />
        </Typography>
    )
  }

  const msg = (errorMsg) ? errorAlert(errorMsg) : <div></div>;

  return (
    <Card className={classes.root}>
      <CardContent>

        {inProgress && progressIndicator()}

        {!inProgress && msg}

        <Typography className={classes.title} gutterBottom>
          <Toggle name='Cameras' checked={armed} onlabel='Armed' offlabel='Disarmed' onChange={cameraChanged} />
        </Typography>
        <Typography className={classes.title} gutterBottom>
          <Toggle name='Thermostats' checked={away} onlabel='Away' offlabel='Home' onChange={thermostatChanged} />
        </Typography>

        {systems.locks && lockWidget()}

      </CardContent>
    </Card>
  );
}
