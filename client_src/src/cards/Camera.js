import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";

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
});

export default function Camera(props) {
  const classes = useStyles();
  const device = props.device;

  const handleClick = function (e) {
    console.log("click: ", e);
  };

  if (!device || !device.status) {
    return <div>No device status available</div>;
  }

  return (
    <Card className={classes.root}>
      <CardContent onClick={handleClick}>
        <Typography className={classes.heading}>{device.name}</Typography>
        <Typography className={classes.heading}>
          {device.status.temperature} &deg;
        </Typography>
        <Typography
          className={classes.title}
          color="textSecondary"
          gutterBottom
        >
          Camera image should go here
        </Typography>
      </CardContent>
    </Card>
  );
}
