import React from 'react';
import PropTypes from 'prop-types';
import {
  Typography, Avatar, Grid,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import MatchStatsPlayers from './MatchStatsPlayers';

import div1 from '../images/RLL_logo.png';
import div2 from '../images/RLL_logo_lower.png';

const useStyles = makeStyles((theme) => ({
  matchInfo: {
    zIndex: 99,
    fontVariant: 'small-caps',
    fontWeight: 700,
    paddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    color: 'whitesmoke',
    textShadow: '1px 1px 4px black',
  },
  divisionIcon: {
    zIndex: 99,
    paddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(1),
  },
}));

export default function MatchStats(props) {
  const { match } = props;
  const classes = useStyles();

  const {
    homeTeamName, awayTeamName, curDivision, games, id, seasonStats,
  } = match;

  console.log('seasonStats', seasonStats);

  const logoSrc = parseInt(curDivision, 10) === 2 ? div2 : div1;

  return (
    <>
      <Grid item>
        <Grid container alignItems="center" justify="center" direction="row">
          {JSON.stringify(seasonStats)}
        </Grid>
      </Grid>
      <MatchStatsPlayers match={match} />
    </>
  );
}

MatchStats.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  match: PropTypes.object.isRequired,
};
