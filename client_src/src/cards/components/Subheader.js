import Grid from "@material-ui/core/Grid";

export default function Subheader(props) {
  const name = props.name;
  const subheader = props.subheader;

  return (
    <Grid component="label" container alignItems="center" spacing={3}>
      <Grid item component="span" xs={5}>
        {name}
      </Grid>
      <Grid item component="span" xs={5}>
        {subheader}
      </Grid>
    </Grid>
  );
}
