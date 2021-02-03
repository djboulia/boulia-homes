import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { LinearProgress } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import Typography from '@material-ui/core/Typography';
import ThermostatSlider from './components/ThermostatSlider';
import MultiToggleButton from './components/MultiToggleButton';
import ServerApi from '../server/ServerApi';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  heading: {
    fontSize: 14,
    fontWeight: 600,
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
  thermostat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    '& > *': {
      margin: theme.spacing(1),
    },
  }
}));

export default function Thermostat(props) {
  const classes = useStyles();
  const device = props.device;
  const id = device.id;

  const [eco, setEco] = React.useState(device.status.eco);
  const [inProgress, setInProgress] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState(undefined);
  const [mode, setMode] = React.useState((device.status.mode === 'HEAT') ? 0 : (device.status.mode === 'COOL') ? 1 : 2);
  const [targetTemp, setTargetTemp] = React.useState(device.status.targetTemperature);


  const getModeString = function(mode) {
    return (mode === 0) ? 'HEAT' : (mode === 1) ? 'COOL' : 'OFF';
  }

  const errorAlert = (msg) => {
    return <Alert severity="error">{msg}</Alert>
  }

  console.log('device ', device);

  const onEcoChanged = function (e) {
    console.log('eco changed: ', e);

    const isEco = (e.selected === 0);

    setInProgress(true);

    ServerApi.setThermostatEco(id, isEco)
      .then((result) => {
        console.log('new state is: ', result);
        setEco(result.eco);
        setErrorMsg(undefined);
        setInProgress(false);
      })
      .catch((e) => {
        console.log('error! setting thermostat back to ' + !isEco);
        setEco(!isEco);
        setErrorMsg('Failed to change thermostat setting');
        setInProgress(false);
      });

  }

  const onModeChanged = function (e) {
    console.log('mode changed: ', e);
    setInProgress(true);

    const strMode = getModeString(e.selected);
    
    ServerApi.setThermostatMode(id, strMode)
      .then((result) => {
        console.log('new state is: ', result);
        device.status.mode = result.mode;
        setMode(e.selected);
        setErrorMsg(undefined);
        setInProgress(false);
      })
      .catch((e) => {
        console.log('error! setting thermostat back to ' + strMode);
        setErrorMsg('Failed to change thermostat setting');
        setInProgress(false);
      });
  }

  const onTempChanged = function( value ) {
    console.log('temp changed to: ', value);

    setInProgress(true);

    const strMode = getModeString(mode);

    ServerApi.setThermostatTemp(id, strMode, value)
      .then((result) => {
        console.log('new state is: ', result);
        setTargetTemp(result.temp);
        setErrorMsg(undefined);
        setInProgress(false);
      })
      .catch((e) => {
        console.log('error! setting thermostat temp to ' + value);
        setTargetTemp(targetTemp);
        setErrorMsg('Failed to change thermostat setting');
        setInProgress(false);
      });

  }

  const progressIndicator = function () {
    return <LinearProgress></LinearProgress>;
  }

  const status = (eco) ? 'eco' : (mode === 2) ? 'off' : (device.status.status === 'HEATING') ? 'heat' : (device.status.status === 'COOLING') ? 'cool' : 'idle';

  console.log('mode ', mode);

  const msg = (errorMsg) ? errorAlert(errorMsg) : <div></div>;

  return (
    <Card className={classes.root}>
      <CardContent>
        {inProgress && progressIndicator()}

        {!inProgress && msg}

        <Typography className={classes.heading} >
          {device.name}
        </Typography>
        <Typography component={'div'} className={classes.title} color="textSecondary" gutterBottom>
          <div className={classes.thermostat}>
            <MultiToggleButton className={classes.thermostat} disabled={eco} selected={mode} labels={['Heat', 'Cool', 'Off']} onChange={onModeChanged} />
          </div>
          <ThermostatSlider temp={device.status.temperature} target={targetTemp} status={status} onChange={onTempChanged}></ThermostatSlider>
          <div className={classes.thermostat}>
            <MultiToggleButton className={classes.thermostat} selected={eco ? 0 : 1} labels={['Eco', 'Off']} onChange={onEcoChanged} />
          </div>
        </Typography>
      </CardContent>
    </Card>
  );
}
