import React from 'react';
import { makeStyles } from '@material-ui/styles';
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import RoomIcon from '@material-ui/icons/Room';
import Camera from './cards/Camera';
import Thermostat from './cards/Thermostat';
import Grid from '@material-ui/core/Grid';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
  },

  accordionHeader: {
    fontSize: 14,
    backgroundColor: theme.palette.grey[900],
    marginBottom: theme.spacing(1)/2,
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

export default function ZonePanel(props) {
  const classes = useStyles();
  const [expanded, setExpanded] = React.useState(null);
  const home = props.home;
  const zone = props.zone;
  const cameras = zone.cameras || [];
  const thermostats = zone.thermostats || [];

  const handleChange = panel => (event, isExpanded) => {
    console.log('panel ', panel);
    setExpanded(isExpanded ? panel : false);

    if (props.onChange) {
      props.onChange(home, zone)
    }
  };

  console.log('expanded ', expanded);

  return (
    <div className={classes.root}>
      <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
        <AccordionSummary className={classes.accordionHeader} expandIcon={<ExpandMoreIcon />}>
          <Typography className={classes.heading}>{zone.name}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={1}>
            {cameras.map((device, index) => (
              <Grid item xs={12} key={device.name}>
                <Camera key={index} device={device} />
              </Grid>
            ))}
            {thermostats.map((device, index) => (
              <Grid item xs={12} key={device.name}>
                <Thermostat key={index} device={device} />
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}