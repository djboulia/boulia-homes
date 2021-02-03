import React from 'react';
import Switch from '@material-ui/core/Switch';
import Grid from '@material-ui/core/Grid';

export default function Toggle(props) {
    const id = props.id;
    const name = props.name;
    const onLabel = props.onlabel;
    const offLabel = props.offlabel;
    const onChange = props.onChange;

    const handleChange = (event) => {
        if (onChange) {
            onChange({ id: id, name: name, checked: event.target.checked });
        }
    };

    console.log('props changed ' + props.checked);

    return (
        <Grid component="label" container alignItems="center" spacing={3}>
            <Grid item component="span" xs={5}>
                {name}
            </Grid>
            <Grid item component="span" xs={3}>{(props.checked) ? onLabel : offLabel}</Grid>
            <Grid item component="span" xs={3}>
                    <Switch 
                        checked={props.checked}
                        onChange={handleChange}
                        color="primary"
                        name={name}
                        inputProps={{ 'aria-label': 'primary checkbox' }}
                    />
            </Grid>
        </Grid>
    );
}
