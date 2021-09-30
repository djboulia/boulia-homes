import { createTheme } from '@material-ui/core/styles';

// A custom theme for this app
const theme = createTheme({
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
