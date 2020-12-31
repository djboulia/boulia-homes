import React from 'react';
import { makeStyles } from '@material-ui/styles';
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import Typography from '@material-ui/core/Typography';
import HomeIcon from '@material-ui/icons/Home';
import System from './cards/System';
import Grid from '@material-ui/core/Grid';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
  },
  icon: {
    fontSize: theme.typography.pxToRem(22.5),
    flexBasis: '10%',
    flexShrink: 0,
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: '33.33%',
    flexShrink: 0,
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
}));

export default function SystemPanel(props) {
  const classes = useStyles();
  const home = props.home;
  const systems = home.systems;

  return (
    <div className={classes.root}>
      <Accordion expanded={true}>
        <AccordionSummary>
          <HomeIcon className={classes.icon} color='primary' />
          <Typography className={classes.heading}>System Summary</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={1}>
            <Grid item xs={12} key={home.name}>
              <System id={home._id} systems={systems} />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}