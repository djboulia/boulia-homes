import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
  headerLabel: {
    fontSize: 14,
    backgroundColor: theme.palette.grey[900],
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    marginLeft: -theme.spacing(3),
    marginRight: -theme.spacing(3),
  },
}));

export default function CardHeader(props) {
  const classes = useStyles();

  return (
    <Typography className={classes.headerLabel} component="div">
      {props.children}
    </Typography>
  );
}
