import { createMuiTheme } from '@material-ui/core/styles';

const baseTheme = createMuiTheme({
  palette: {
    primary: {
      light: '#8e8e8e',
      main: '#616161',
      dark: '#373737',
    },
    secondary: {
      light: '#f05545',
      main: '#b71c1c',
      dark: '#7f0000',
    },
  },
});

export default baseTheme;
