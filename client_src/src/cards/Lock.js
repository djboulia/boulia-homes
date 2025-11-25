import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import MultiToggleButton from "./components/MultiToggleButton";
import { LinearProgress } from "@material-ui/core";
import ServerApi from "../server/ServerApi";
import Alert from "@material-ui/lab/Alert";

const useStyles = makeStyles({
  root: {
    width: "100%",
  },
  heading: {
    fontSize: 14,
    fontWeight: 600,
  },
  title: {
    fontSize: 14,
  },
  lock: {
    fontSize: 12,
  },
});

export default function Locks(props) {
  const classes = useStyles();
  const device = props.device;
  const [inProgress, setInProgress] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState(undefined);

  const handleClick = function (e) {
    console.log("click: ", e);
  };

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
        device.status.locked = result.locked;
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
    <Card className={classes.root}>
      <CardContent onClick={handleClick}>
        {inProgress && progressIndicator()}

        {!inProgress && msg}

        <Typography className={classes.heading}>{device.name}</Typography>
        {device.status.locked !== undefined ? (
          <MultiToggleButton
            className={classes.lock}
            selected={device.status.locked ? 1 : 0}
            labels={["UNLOCKED", "LOCKED"]}
            onChange={onLockChanged}
          />
        ) : (
          <Typography className={classes.lock}>UNKNOWN</Typography>
        )}
      </CardContent>
    </Card>
  );
}
