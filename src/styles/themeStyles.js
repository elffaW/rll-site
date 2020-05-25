import { createStyles, withStyles } from '@material-ui/core/styles';

// eslint-disable-next-line import/prefer-default-export
export const styles = withStyles((theme) => createStyles({
  paper: {
    padding: theme.spacing(1),
    margin: theme.spacing(1),
    textAlign: 'center',
    backgroundColor: theme.palette.primary.main,
    width: '100%',
  },
}));
