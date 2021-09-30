/**
 * NOT USED - WORK IN PROGRESS
 */
import React from 'react';
import {makeStyles } from '@material-ui/core/styles';
import LockIcon from '@material-ui/icons/Lock';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import ToggleButton from '@material-ui/lab/ToggleButton'
import Grid from '@material-ui/core/Grid';

const useStyles = makeStyles((theme) => ({
    onStyle: {
        color: '00FF00',
        backgroundColor: '#777777',
    },
    offStyle: {
        color: '#FF0000',
        backgroundColor: '#ffffff',
    }
}));

export default function ToggleIcon(props) {
    const classes = useStyles();
    const id = props.id;
    const name = props.name;
    const onLabel = props.onlabel;
    const offLabel = props.offlabel;
    const onChange = props.onChange;

    const handleChange = (event, item) => {
        console.log('handleChange ', event.currentTarget, item);
        const checked = (item === 'lockOpen') ? false : true;

        if (onChange && checked != props.checked) {
            onChange({ id: id, name: name, checked: checked });
        }
    };

    console.log('props changed ' + props.checked);

    return (
        <Grid component="label" container alignItems="center" spacing={3}>
            <Grid item component="span" xs={5}>
                {name}
            </Grid>
            <Grid item component="span" xs={3}>{(props.checked) ? onLabel : offLabel}</Grid>
            <Grid item component="span" xs={2}>
                    <ToggleButton
                        className={!props.checked ? classes.onStyle : classes.offStyle}
                        onChange={handleChange}
                        value="lockOpen" 
                        aria-label="lockOpen">
                        <LockOpenIcon />
                    </ToggleButton>
            </Grid>
            <Grid item component="span" xs={2}>
                    <ToggleButton 
                        className={props.checked ? classes.onStyle : classes.offStyle}
                        onChange={handleChange}
                        value="Lock" 
                        aria-label="lock">
                        <LockIcon/>
                    </ToggleButton>
            </Grid>
        </Grid>
    );
}
