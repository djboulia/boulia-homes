import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
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
});

export default function Thermostat(props) {
  const classes = useStyles();
  const device = props.device;

  const handleClick = function( e ) {
    console.log('click: ' , e );
  }

  return (
    <Card className={classes.root}>
      <CardContent onClick={handleClick}>
        <Typography className={classes.heading} >
          {device.name}
        </Typography>
        <Typography className={classes.title} color="textSecondary" gutterBottom>
          Thermostat temperature and status should go here
        </Typography>
      </CardContent>
    </Card>
  );
}
