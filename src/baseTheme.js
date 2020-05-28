import { createMuiTheme } from '@material-ui/core/styles';

const baseTheme = createMuiTheme({
  palette: {
    primary: {
      light: '#8e8e8e',
      main: '#616161',
      dark: '#373737',
    },
    secondary: {
      light: '#ff5f52',
      main: '#c62828',
      dark: '#8e0000',
    },
  },
  otherColors: {
    text: {
      light: '#d0d0d0',
      dark: '#202020',
    },
  },
});

export default baseTheme;
