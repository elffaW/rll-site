import { createMuiTheme } from '@material-ui/core/styles';

const baseTheme = createMuiTheme({
  palette: {
    // gray
    primary: {
      main: '#616161',
      light: '#8e8e8e',
      dark: '#8e0000', // red (same as secondary.dark)
      darker: '#404040', // dark gray
      darkest: '#202020', // darker gray
    },
    // red
    secondary: {
      main: '#8e0000',
      light: '#e5737366', // includes transparency
      dark: '#5b0000',
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
      lighter: 'whitesmoke',
      light: '#d0d0d0',
      dark: '#202020',
    },
    background: {
      dark: '#4e0000', // darker red
      mainDarker: '#757575',
    },
  },
});

export default baseTheme;
