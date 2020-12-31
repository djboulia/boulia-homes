import { red } from '@material-ui/core/colors';
import { createMuiTheme } from '@material-ui/core/styles';
import purple from '@material-ui/core/colors/purple';
import green from '@material-ui/core/colors/green';


// A custom theme for this app
const theme = createMuiTheme({
  palette: {
    type: "dark",
    primary: {
      main: '#648dae',
    },
    secondary: {
      main: '#aa647b',
    },
  },
});

export default theme;
