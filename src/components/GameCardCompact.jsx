import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  Grid, Typography, Avatar,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { timezoneLookup } from './utils/dateUtils';

const useStyles = makeStyles((theme) => ({
  darkPaper: {
    textAlign: 'center',
    color: theme.otherColors.text.light,
    backgroundColor: theme.palette.primary.dark,
  },
  teamName: {
    fontVariant: 'small-caps',
    float: 'left',
    color: 'rgba(0, 0, 0, 0.87)',
  },
  subtitle: {
    fontVariant: 'small-caps',
    color: theme.palette.primary.light,
    fontStyle: 'italic',
  },
  teamRecord: {
    marginTop: 6,
    marginLeft: theme.spacing(1),
  },
}));

/**
 * GAME OBJECT: { id: 1, homeTeam: 1, awayTeam: 2, gameTime: '05/29/2020 7:30PM CT', arena: 'Salty Shores', }
 *
 */
function GameCardCompact(props) {
  const {
    team1,
    team2,
    time,
    arena,
    isPlayoffs,
    homeScoreA,
    homeScoreB,
    homeScoreC,
    awayScoreA,
    awayScoreB,
    awayScoreC,
  } = props;
  const classes = useStyles();

  const timeAsDate = new Date(time);
  let gameTime = time;
  if ((timeAsDate instanceof Date && !Number.isNaN(timeAsDate))) { // time is a valid date, we can format it as such
    gameTime = timeAsDate.toLocaleString() + timezoneLookup(new Date().getTimezoneOffset());
  }
  const gameLocation = arena;

  // truthiness of 0 is false, so hasScores is true if any score is non-zero
  const hasScores = !!(parseInt(homeScoreA, 10)
                    || parseInt(awayScoreA, 10)
                    || parseInt(homeScoreB, 10)
                    || parseInt(awayScoreB, 10)
                    || parseInt(homeScoreC, 10)
                    || parseInt(awayScoreC, 10));
  let homeWinnerA = false;
  let homeWinnerB = false;
  let homeWinnerC = false;
  let homeWinnerOverall = false;
  let awayWinnerOverall = false;
  if (hasScores) {
    homeWinnerA = parseInt(homeScoreA, 10) > parseInt(awayScoreA, 10);
    homeWinnerB = parseInt(homeScoreB, 10) > parseInt(awayScoreB, 10);
    homeWinnerC = parseInt(homeScoreC, 10) > parseInt(awayScoreC, 10);

    homeWinnerOverall = isPlayoffs
      ? ((homeWinnerA && homeWinnerB) || (homeWinnerA && homeWinnerC) || (homeWinnerB && homeWinnerC))
      : homeWinnerA && homeWinnerB;
    awayWinnerOverall = isPlayoffs
      ? ((!homeWinnerA && !homeWinnerB) || (!homeWinnerA && !homeWinnerC) || (!homeWinnerB && !homeWinnerC))
      : !homeWinnerA && !homeWinnerB;
  }

  const homeStyle = {};
  const awayStyle = {};
  if (homeWinnerOverall) {
    homeStyle.color = '#8e8e8e';
    if (isPlayoffs) awayStyle.textDecoration = 'line-through';
  }
  if (team1.name.length > 14) {
    homeStyle.letterSpacing = `calc(0.05vw - ${team1.name.length / 8}px)`;
  }

  if (awayWinnerOverall) {
    awayStyle.color = '#8e8e8e';
    if (isPlayoffs) homeStyle.textDecoration = 'line-through';
  }
  if (team2.name.length > 14) {
    awayStyle.letterSpacing = `calc(0.05vw - ${team2.name.length / 8}px)`;
  }

  return (
    <Grid container alignItems="center" justify="flex-start">
      <Grid item xs={2}>
        <Grid container spacing={0} direction="column" alignItems="flex-start" justify="flex-start">
          <Grid item xs>
            <Typography variant="h4">
              <Grid container spacing={0} direction="row" alignItems="flex-start" justify="space-around">
                {team1.rank}
                <Avatar src={team1.logo} variant="square" />
              </Grid>
            </Typography>
          </Grid>
          <Grid item xs>
            <Typography variant="h4">
              <Grid container spacing={0} direction="row" alignItems="flex-start" justify="space-around">
                {team2.rank}
                <Avatar src={team2.logo} variant="square" />
              </Grid>
            </Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={7}>
        <Grid container spacing={0} direction="column" alignItems="flex-start" justify="flex-start">
          <Grid item xs>
            <Grid container spacing={0} direction="row" alignItems="flex-start" justify="space-around">
              <Link to={`/teams/${team1.name}`} exact>
                <Typography variant="h5" className={classes.teamName} style={homeStyle}>
                  {team1.name}
                </Typography>
              </Link>
              <Typography variant="body1" className={classes.teamRecord}>
                {`${team1.wins}-${team1.losses}`}
              </Typography>
            </Grid>
          </Grid>
          <Grid item xs>
            <Grid container spacing={0} direction="row" alignItems="flex-start" justify="space-around">
              <Link to={`/teams/${team2.name}`} exact>
                <Typography variant="h5" className={classes.teamName} style={awayStyle}>
                  {team2.name}
                </Typography>
              </Link>
              <Typography variant="body1" className={classes.teamRecord}>
                {`${team2.wins}-${team2.losses}`}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {hasScores && (
        <Grid item xs={3}>
          <Grid container spacing={0} direction="column" alignItems="flex-start" justify="flex-start">
            <Grid container justify="space-between">
              <Grid item xs={4}>
                <Typography variant="h5" className={classes.teamName} style={homeWinnerA ? { color: '#8e8e8e' } : null}>
                  {homeScoreA}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="h5" className={classes.teamName} style={homeWinnerB ? { color: '#8e8e8e' } : null}>
                  {homeScoreB}
                </Typography>
              </Grid>
              {(isPlayoffs && (!!parseInt(homeScoreC, 10) || !!parseInt(awayScoreC, 10))) && (
                <Grid item xs={4}>
                  <Typography variant="h5" className={classes.teamName} style={homeWinnerC ? { color: '#8e8e8e' } : null}>
                    {homeScoreC}
                  </Typography>
                </Grid>
              )}
            </Grid>
            <Grid container justify="space-between">
              <Grid item xs={4}>
                <Typography variant="h5" className={classes.teamName} style={!homeWinnerA ? { color: '#8e8e8e' } : null}>
                  {awayScoreA}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="h5" className={classes.teamName} style={!homeWinnerB ? { color: '#8e8e8e' } : null}>
                  {awayScoreB}
                </Typography>
              </Grid>
              {(isPlayoffs && (!!parseInt(homeScoreC, 10) || !!parseInt(awayScoreC, 10))) && (
                <Grid item xs={4}>
                  <Typography variant="h5" className={classes.teamName} style={!homeWinnerC ? { color: '#8e8e8e' } : null}>
                    {awayScoreC}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      )}
      {(gameTime && gameLocation) && (
        <Grid item xs={12}>
          <Typography className={classes.subtitle} style={{ marginTop: -12, float: 'right', paddingRight: 8 }}>
            {`${gameTime} | ${gameLocation}`}
          </Typography>
        </Grid>
      )}
    </Grid>
  );
}

GameCardCompact.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  team1: PropTypes.object.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  team2: PropTypes.object.isRequired,
  time: PropTypes.string,
  arena: PropTypes.string,
  isPlayoffs: PropTypes.bool,
  homeScoreA: PropTypes.string,
  homeScoreB: PropTypes.string,
  homeScoreC: PropTypes.string,
  awayScoreA: PropTypes.string,
  awayScoreB: PropTypes.string,
  awayScoreC: PropTypes.string,
};
GameCardCompact.defaultProps = {
  time: '',
  arena: '',
  isPlayoffs: false,
  homeScoreA: '0',
  homeScoreB: '0',
  homeScoreC: '0',
  awayScoreA: '0',
  awayScoreB: '0',
  awayScoreC: '0',
};

export default GameCardCompact;
