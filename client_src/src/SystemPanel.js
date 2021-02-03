import React from 'react';
import { makeStyles } from '@material-ui/styles';
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import Typography from '@material-ui/core/Typography';
import HomeIcon from '@material-ui/icons/Home';
import System from './cards/System';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
  },
  accordion: {
    padding: '0px',
  },
  icon: {
    fontSize: theme.typography.pxToRem(22.5),
    flexBasis: '10%',
    flexShrink: 0,
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
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
      <Accordion className={classes.accordion} expanded={true}>
        <AccordionSummary className={classes.accordion}>
          <HomeIcon className={classes.icon} color='primary' />
          <Typography className={classes.heading}>System Summary</Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.accordion}>
              <System name={home.name} id={home._id} systems={systems} />
        </AccordionDetails>
      </Accordion>
    </div>
  );
}