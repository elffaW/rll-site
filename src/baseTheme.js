import { createMuiTheme } from '@material-ui/core/styles';

const baseTheme = createMuiTheme({
  palette: {
    // gray
    primary: {
      main: '#616161',
      light: '#8e8e8e',
      dark: '#8e0000', // red (same as secondary.dark)
    },
    // red
    secondary: {
      main: '#c62828',
      light: '#ff5f52',
      dark: '#8e0000',
    },
    // // blue
    // primary: {
    //   main: '#01579b',
    //   light: '#8e8e8e', // this is gray, light blue originally was: '#4f83cc',
    //   dark: '#002f6c',
    // },
    // // orange
    // secondary: {
    //   main: '#f57c00',
    //   light: '#ffad42',
    //   dark: '#bb4d00',
    // },
  },
  otherColors: {
    text: {
      light: '#d0d0d0',
      dark: '#202020',
    },
  },
});

export default baseTheme;
