import { Typography } from "@material-ui/core";
import Toggle from "./components/Toggle";
import Subheader from "./components/Subheader";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import LockGroupItem from "./LockGroupItem";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  title: {
    fontSize: 14,
  },
  spacer: {
    paddingTop: 20,
    paddingBottom: 20,
  },
}));

export default function LockGroup({ locks, onLocksChanged }) {
  const classes = useStyles();

  if (!locks) return null;

  const allLocked =
    locks.filter((lock) => lock.status.lockState === "LOCKED").length ===
    locks.length;
  const allUnlocked =
    locks.filter(
      (lock) =>
        lock.status.lockState === "UNLOCKED" ||
        lock.status.lockState === "UNKNOWN" // treat unknown as unlocked
    ).length === locks.length;

  // show it as a single toggle if all locked or all unlocked
  if (allLocked || allUnlocked) {
    return (
      <Typography className={classes.title} gutterBottom>
        <Toggle
          name="Doors"
          checked={locked}
          onlabel="Locked"
          offlabel="Unlocked"
          onChange={onLocksChanged}
        />
      </Typography>
    );
  }

  // otherwise show individual locks
  return (
    <Typography className={classes.title} gutterBottom>
      <Subheader name="Doors" subheader="Mixed States" />

      <div className={classes.spacer}>
        {locks.map((lock, index) => (
          <Grid
            key={index}
            component="label"
            container
            alignItems="flex-end"
            spacing={3}
          >
            <LockGroupItem key={index} device={lock} xs={3} />
          </Grid>
        ))}
      </div>
    </Typography>
  );
}
