import { createStyles, withStyles } from '@material-ui/core/styles';

// eslint-disable-next-line import/prefer-default-export
export const styles = withStyles((theme) => createStyles({
  paper: {
    // padding: theme.spacing(1),
    marginTop: theme.spacing(1),
    textAlign: 'center',
    backgroundColor: theme.palette.primary.light,
    width: '100%',
  },
  teamName: {
    fontVariant: 'small-caps',
    float: 'left',
    color: 'rgba(0, 0, 0, 0.87)',
  },
}));
