import React from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import EcoIcon from '@material-ui/icons/Eco';
import Slider from '@material-ui/core/Slider';

const COLOR_COOL = '#007AF1';
const COLOR_HEAT = '#E36304';
const COLOR_IDLE = '#888888';

const useStyles = makeStyles((theme) => ({
    root: {
        padding: '40px 0 0 0'
    },
    eco: {
        color: '#00AA00'
    },
    center: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        '& > *': {
            margin: theme.spacing(1),
        },
    }
}));

function valuetext(value) {
    return `${value}°F`;
}

export default function ThermostatSlider(props) {
    const classes = useStyles();

    const currentTemp = props.temp ? Math.round(props.temp) : 70;
    const targetTemp = props.target ? Math.round(props.target) : 70;
    const min = props.min ? Math.round(props.min) : 55;
    const max = props.max ? Math.round(props.max) : 85;
    const status = props.status;
    const onChange = props.onChange;

    let lastValue = undefined;
    let lastTimeout = undefined;

    const cooling = status ? status.toLowerCase() === "cool" : false;
    const heating = status ? status.toLowerCase() === "heat" : false;
    const eco = status ? status.toLowerCase() === "eco" : false;
    const off = status ? status.toLowerCase() === "off" : false;

    // only show the mim/max marks in eco mode and
    // when the current temp isn't too close to the min/max
    const marks = [];

    if (eco && (currentTemp - min) >= 4) {
        marks.push({
            value: min,
            label: min + '°F',
        });
    }

    marks.push({
        value: currentTemp,
        label: currentTemp + '°F',
    });

    if (eco && (max - currentTemp) >= 4) {
        marks.push({
            value: max,
            label: max + '°F',
        });
    }

    const TempSlider = withStyles({
        root: {
            height: 8,
            color: (cooling) ? COLOR_COOL : (heating) ? COLOR_HEAT : COLOR_IDLE,
        },
        track: {
            height: 8,
            borderRadius: 4,
        },
        rail: {
            height: 8,
            borderRadius: 4,
        },
    })(Slider);

    /**
     * the default slider behavior will send an event for each change 
     * in value for the slider, including when a user drags it across 
     * multiple values.  we put in a delay on the slider so that we 
     * don't flood the consumer with temp change events as a user drags
     * the slider.  After one second of inactivity, we'll fire the value.
     */
    const sliderChanged = function (event, value) {
        console.log('value ', value);
        lastValue = value;

        if (lastTimeout != undefined) {
            // previous timer in progress, clear it and start again
            // console.log('clearing previous timer');
            clearTimeout(lastTimeout);
        }

        lastTimeout = setTimeout(() => {
            // console.log('firing temp event with value ' + lastValue);
            clearTimeout(lastTimeout);
            lastValue = undefined;
            lastTimeout = undefined;    // reset for next time

            if (onChange) {
                onChange(value);
            }
        }, 1000);
    }

    const showEco = function () {
        return (<EcoIcon className={classes.eco}></EcoIcon>);
    }

    return (
        <div className={eco ? undefined : classes.root}>
            <div className={classes.center}>
                {eco && showEco()}
            </div>

            <TempSlider
                defaultValue={(eco) ? currentTemp : targetTemp}
                getAriaValueText={valuetext}
                aria-labelledby="discrete-slider-always"
                onChange={sliderChanged}
                step={1}
                min={min}
                max={max}
                marks={marks}
                valueLabelDisplay={(eco || off) ? 'off' : 'on'}
            />
        </div>
    );
}
