import React from 'react';
import PropTypes from 'prop-types';
import {
  Grid, Typography, Avatar, LinearProgress,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  statIcon: {
    filter: 'invert(100%)',
    paddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(1),
  },
  statText: {
    fontVariant: 'small-caps',
  },
  statBar: {
    minHeight: theme.spacing(1),
    width: '100%',
  },
  statAvgMarker: {
    marginTop: -theme.spacing(2.5),
    marginBottom: -theme.spacing(1.5),
    zIndex: 1,
  },
  statBarValue: {
    marginTop: -theme.spacing(0.5),
  },
  statBarText: {
    marginTop: -theme.spacing(2),
  },
}));

export default function StatBoxVsAvg(props) {
  const {
    logo, value, unit, avgValue, minValue, maxValue, statName,
  } = props;
  const classes = useStyles();

  let relativeValue = 100;
  let relativeAvg = 0;
  if (minValue !== undefined && maxValue !== undefined && value !== undefined) {
    relativeValue = ((value - minValue) / (maxValue - minValue)) * 100;
    relativeAvg = ((avgValue - minValue) / (maxValue - minValue));
    relativeAvg -= 0.5;
    relativeAvg *= 1200; // 600% is approx the end of the bar, so on a scale of -0.5 to 0.5, we multiply by 1200
    if (relativeAvg < 0) {
      relativeAvg = Math.max(relativeAvg, -400);
    } else {
      relativeAvg = Math.min(relativeAvg, 400);
    }
  }

  return (
    <Grid container direction="column" alignItems="center" justify="center">
      <Grid item>
        <Grid container direction="row" alignItems="flex-end" justify="center">
          {logo && <Avatar src={logo} className={classes.statIcon} variant="square" />}
          <Typography variant="h6" className={classes.statText}>{statName}</Typography>
        </Grid>
      </Grid>
      <Grid item>
        <Typography variant="h5" className={classes.statText}>
          {`${value} ${unit}`}
        </Typography>
      </Grid>
      <Grid container direction="row" alignItems="flex-start" justify="space-between">
        <Grid item xs={12}>
          <LinearProgress
            variant="determinate"
            className={classes.statBar}
            color={value > avgValue ? 'secondary' : 'primary'}
            value={relativeValue}
          />
        </Grid>
        <Grid item xs={1}>
          <Grid container direction="column" alignItems="center" justify="center">
            <Typography variant="overline" className={classes.statBarValue}>{minValue}</Typography>
            <Typography variant="overline" className={classes.statBarText}>min</Typography>
          </Grid>
        </Grid>
        <Grid item xs={1}>
          <Grid container direction="column" alignItems="center" justify="center" style={{ marginLeft: `${relativeAvg}%` }}>
            <Typography variant="overline" className={classes.statAvgMarker}>|</Typography>
            <Typography variant="overline" className={classes.statBarValue}>{avgValue}</Typography>
            <Typography variant="overline" className={classes.statBarText}>avg</Typography>
          </Grid>
        </Grid>
        <Grid item xs={1}>
          <Grid container direction="column" alignItems="center" justify="center">
            <Typography variant="overline" className={classes.statBarValue}>{maxValue}</Typography>
            <Typography variant="overline" className={classes.statBarText}>max</Typography>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

StatBoxVsAvg.propTypes = {
  logo: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  unit: PropTypes.string.isRequired,
  avgValue: PropTypes.number.isRequired,
  minValue: PropTypes.number.isRequired,
  maxValue: PropTypes.number.isRequired,
  statName: PropTypes.string.isRequired,
};
