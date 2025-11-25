import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import MultiToggleButton from "./components/MultiToggleButton";
import { LinearProgress } from "@material-ui/core";
import ServerApi from "../server/ServerApi";
import Alert from "@material-ui/lab/Alert";
import Grid from "@material-ui/core/Grid";

const useStyles = makeStyles({
  root: {
    paddingTop: 10,
    paddingBottom: 10,
    marginLeft: 5,
    marginRight: 5,
  },
});

export default function LockGroupItem(props) {
  const classes = useStyles();
  const device = props.device;
  const [inProgress, setInProgress] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState(undefined);

  const onLockChanged = function (event) {
    setInProgress(true);

    // index 0 = unlocked, 1 = locked
    const selected = event.selected;
    console.log("selected ", selected);
    const locked = selected === 0 ? false : true;
    console.log("setting the lock to ", locked);

    ServerApi.setLock(device.id, device.type, locked)
      .then((result) => {
        console.log("new state is: ", result);
        device.status.lockState = result.locked ? "LOCKED" : "UNLOCKED";
        setErrorMsg(undefined);
        setInProgress(false);
      })
      .catch((e) => {
        console.log("error! setting lock back to " + locked);
        setErrorMsg("Failed to change lock setting");
        setInProgress(false);
      });
  };

  console.log("device ", device);

  if (!device || !device.status) {
    return <div>No device status available</div>;
  }

  const progressIndicator = function () {
    return <LinearProgress></LinearProgress>;
  };

  const errorAlert = (msg) => {
    return <Alert severity="error">{msg}</Alert>;
  };

  const msg = errorMsg ? errorAlert(errorMsg) : <div></div>;

  return (
    <>
      {inProgress && progressIndicator()}

      {!inProgress && msg}

      <Grid
        className={classes.root}
        component="label"
        container
        alignItems="center"
        spacing={3}
      >
        <Grid item component="span" xs={5}>
          {device.name}
        </Grid>
        <Grid item component="span" xs={5}>
          {device.status.lockState === "LOCKED" ||
          device.status.lockState === "UNLOCKED" ? (
            <MultiToggleButton
              className={classes.lock}
              selected={device.status.lockState === "LOCKED" ? 1 : 0}
              labels={["UNLOCKED", "LOCKED"]}
              onChange={onLockChanged}
            />
          ) : device.status.lockState === "UNKNOWN" ? (
            <MultiToggleButton
              className={classes.lock}
              selected={device.status.lockState === "LOCKED" ? 1 : 0}
              labels={["UNKNOWN", "LOCKED"]}
              onChange={onLockChanged}
            />
          ) : (
            <Typography className={classes.lock}>
              {device.status.lockState}
            </Typography>
          )}{" "}
        </Grid>
      </Grid>
    </>
  );
}
