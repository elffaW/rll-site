import { createStyles, withStyles, makeStyles } from '@material-ui/core/styles';

const getStyles = (theme) => ({
  paper: {
    // padding: theme.spacing(1),
    marginTop: theme.spacing(1),
    textAlign: 'center',
    backgroundColor: theme.palette.primary.light,
    width: '100%',
  },
  darkPaper: {
    textAlign: 'center',
    color: theme.otherColors.text.light,
    backgroundColor: theme.palette.primary.dark,
    margin: theme.spacing(1),
    marginTop: 0,
    paddingLeft: theme.spacing(1),
  },
  darkGrayPaper: {
    textAlign: 'center',
    color: theme.otherColors.text.light,
    backgroundColor: `${theme.palette.primary.darker}C0`, // add transparency
    margin: theme.spacing(1),
    marginTop: 0,
    paddingLeft: theme.spacing(1),
  },
  darkestPaper: {
    textAlign: 'center',
    color: theme.otherColors.text.lighter,
    backgroundColor: theme.palette.primary.darkest,
    marginLeft: -theme.spacing(2),
    paddingTop: 0,
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    width: '100%',
  },
  statsPaper: {
    textAlign: 'center',
    color: theme.otherColors.text.light,
    backgroundColor: theme.palette.primary.dark,
    marginTop: -theme.spacing(1),
    marginBottom: theme.spacing(7.5),
    height: '100%',
  },
  videoPaper: {
    width: '100%',
    marginTop: theme.spacing(1),
    textAlign: 'center',
    backgroundColor: theme.palette.secondary.main,
    color: theme.otherColors.text.lighter,
    fontVariant: 'small-caps',
    textShadow: '1px 1px 2px black',
  },
  paddedPaper: {
    margin: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: theme.palette.primary.light,
    width: '100%',
  },
  darkerPaper: {
    margin: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    backgroundColor: theme.palette.primary.main,
  },
  teamName: {
    fontVariant: 'small-caps',
    float: 'left',
    color: 'rgba(0, 0, 0, 0.87)',
  },
  playerName: {
    fontVariant: 'small-caps',
    float: 'left',
    color: 'rgba(0, 0, 0, 0.87)',
    paddingLeft: theme.spacing(1),
  },
  subtitle: {
    fontVariant: 'small-caps',
    color: theme.palette.primary.light,
  },
  subtitleDark: {
    fontVariant: 'small-caps',
    color: theme.palette.primary.dark,
  },
  gameSubtitle: {
    fontVariant: 'small-caps',
    color: theme.otherColors.text.dark,
    fontStyle: 'italic',
    textTransform: 'lowercase',
  },
  gameTimeMod: {
    color: theme.palette.secondary.main,
  },
  upcomingHeader: {
    fontVariant: 'small-caps',
    marginLeft: theme.spacing(4),
    marginTop: theme.spacing(2),
    textShadow: `2px 2px 4px ${theme.palette.primary.main}`,
  },
  upcomingColumns: {
    fontVariant: 'small-caps',
    fontWeight: 700,
    marginLeft: theme.spacing(4),
    marginTop: theme.spacing(2),
  },
  teamTrophy: {
    float: 'right',
  },
  champTrophy: {
    filter: 'invert(70%) sepia(41%) saturate(1219%) hue-rotate(359deg) brightness(114%) contrast(110%)',
  },
  runnerUpTrophy: {
    filter: 'invert(90%) sepia(0%) saturate(1063%) hue-rotate(140deg) brightness(87%) contrast(88%)',
  },
});
/* eslint-disable import/prefer-default-export */
export const styles = withStyles((theme) => createStyles(getStyles(theme)));

export const stylesHook = makeStyles((theme) => getStyles(theme));
