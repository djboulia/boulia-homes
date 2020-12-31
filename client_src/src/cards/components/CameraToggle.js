import React from 'react';
import Switch from '@material-ui/core/Switch';
import Grid from '@material-ui/core/Grid';

export default function CameraToggle(props) {
    const name = props.name;
    const onChange = props.onChange;

    const handleChange = (event) => {
        if (onChange) {
            onChange({ name: name, checked: event.target.checked });
        }
    };

    console.log('props changed ' + props.checked);

    return (
        <Grid container component="span" direction="row" spacing={3}>
            <Grid item component="span" xs={6}>
                {name}
            </Grid>

            <Grid item component="span" xs={6} >

                <Grid component="label" container alignItems="center" spacing={1}>
                    <Grid item component="span" >Disarmed</Grid>
                    <Grid item component="span" >
                        <Switch
                            checked={props.checked}
                            onChange={handleChange}
                            color="primary"
                            name={name}
                            inputProps={{ 'aria-label': 'primary checkbox' }}
                        />
                    </Grid>
                    <Grid item component="span" >Armed</Grid>
                </Grid>

            </Grid>

        </Grid>
    );
}
