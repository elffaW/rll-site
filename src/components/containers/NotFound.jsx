import React from 'react';
import { Paper, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import SentimentVeryDissatisfiedIcon from '@material-ui/icons/SentimentVeryDissatisfied';
import { NavLink } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  paper: {
    // padding: theme.spacing(1),
    // margin: theme.spacing(1),
    textAlign: 'center',
    backgroundColor: theme.palette.primary.light,
    width: '100%',
  },
}));

export default function NotFound() {
  const classes = useStyles();
  return (
    <Paper className={classes.paper}>
      <Typography variant="h2">
        <SentimentVeryDissatisfiedIcon fontSize="large" variant="outlined" color="secondary" loading />
          &nbsp;&nbsp;Error 404: Page Not Found
      </Typography>
      <Typography variant="h4">
          The page you were looking for was not found. Click&nbsp;
        <NavLink to="/" exact>
            here
        </NavLink>
          &nbsp;to go back to the main dashboard.
      </Typography>
    </Paper>
  );
}
