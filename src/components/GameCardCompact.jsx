import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  Grid, Typography, Avatar,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { timezoneLookup } from './utils/dateUtils';

const useStyles = makeStyles((theme) => ({
  teamName: {
    fontVariant: 'small-caps',
    float: 'left',
    color: 'whitesmoke',
    textShadow: '0 0 3px black',
  },
  subtitle: {
    fontVariant: 'small-caps',
    color: theme.palette.primary.light,
    fontStyle: 'italic',
    textTransform: 'lowercase',
  },
  teamRecord: {
    marginTop: 6,
    marginLeft: theme.spacing(1),
  },
  teamRank: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(0.5),
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
    matchId,
    time,
    arena,
    matchResult,
    matchComplete,
    isPlayoffs,
    homeScoreA,
    homeScoreB,
    homeScoreC,
    homeScoreD,
    homeScoreE,
    awayScoreA,
    awayScoreB,
    awayScoreC,
    awayScoreD,
    awayScoreE,
    upcomingOverview,
    streamRoom,
  } = props;
  const classes = useStyles();

  const timeAsDate = new Date(time);
  let gameTime = time;
  if ((timeAsDate instanceof Date && !Number.isNaN(timeAsDate))) { // time is a valid date, we can format it as such
    gameTime = timeAsDate.toLocaleString() + timezoneLookup(new Date().getTimezoneOffset());
  }
  const gameLocation = arena;

  let gamesPlayed = 1;
  if (parseInt(homeScoreE, 10) || parseInt(awayScoreE, 10)) {
    gamesPlayed = 5;
  } else if (parseInt(homeScoreD, 10) || parseInt(awayScoreD, 10)) {
    gamesPlayed = 4;
  } else if (parseInt(homeScoreC, 10) || parseInt(awayScoreC, 10)) {
    gamesPlayed = 3;
  } else if (parseInt(homeScoreB, 10) || parseInt(awayScoreB, 10)) {
    gamesPlayed = 2;
  }
  const gameCellSize = Math.floor(12 / gamesPlayed);

  // truthiness of 0 is false, so hasScores is true if any score is non-zero
  const hasScores = !!(parseInt(homeScoreA, 10)
                    || parseInt(awayScoreA, 10)
                    || parseInt(homeScoreB, 10)
                    || parseInt(awayScoreB, 10)
                    || parseInt(homeScoreC, 10)
                    || parseInt(awayScoreC, 10));
  let homeWinnerOverall = false;
  let awayWinnerOverall = false;
  let homeWinnerA = false;
  let homeWinnerB = false;
  let homeWinnerC = false;
  let homeWinnerD = false;
  let homeWinnerE = false;
  if (!upcomingOverview) {
    homeWinnerA = parseInt(homeScoreA, 10) > parseInt(awayScoreA, 10);
    homeWinnerB = parseInt(homeScoreB, 10) > parseInt(awayScoreB, 10);
    homeWinnerC = parseInt(homeScoreC, 10) > parseInt(awayScoreC, 10);
    homeWinnerD = parseInt(homeScoreD, 10) > parseInt(awayScoreD, 10);
    homeWinnerE = parseInt(homeScoreE, 10) > parseInt(awayScoreE, 10);

    if (!!matchResult && matchComplete) {
      homeWinnerOverall = (matchResult === 'W');
      awayWinnerOverall = (matchResult === 'L');
    } else if (hasScores) {
      let homeWins = homeWinnerA ? 1 : 0;
      homeWins += homeWinnerB ? 1 : 0;
      homeWins += homeWinnerC ? 1 : 0;
      homeWins += homeWinnerD ? 1 : 0;
      homeWins += homeWinnerE ? 1 : 0;

      let awayWins = !homeWinnerA ? 1 : 0;
      awayWins += !homeWinnerB ? 1 : 0;
      awayWins += !homeWinnerC ? 1 : 0;
      awayWins += !homeWinnerD ? 1 : 0;
      awayWins += !homeWinnerE ? 1 : 0;

      // console.log('homeWins', homeWins);
      // console.log('awayWins', awayWins);

      homeWinnerOverall = isPlayoffs
        ? (homeWins > Math.floor(gamesPlayed / 2))
        : homeWinnerA && homeWinnerB;
      awayWinnerOverall = isPlayoffs
        ? (awayWins > Math.floor(gamesPlayed / 2))
        : !homeWinnerA && !homeWinnerB;
    }
  }

  const homeStyle = {};
  const awayStyle = {};
  if (homeWinnerOverall) {
    homeStyle.color = 'whitesmoke';
    awayStyle.color = '#8e8e8e';
    if (isPlayoffs) awayStyle.textDecoration = 'line-through';
  } else if (awayWinnerOverall) {
    homeStyle.color = '#8e8e8e';
    awayStyle.color = 'whitesmoke';
    if (isPlayoffs) homeStyle.textDecoration = 'line-through';
  }

  if (team1.name.length > 14) {
    homeStyle.letterSpacing = `calc(0.05vw - ${team1.name.length / 8}px)`;
  }
  if (team2.name.length > 14) {
    awayStyle.letterSpacing = `calc(0.05vw - ${team2.name.length / 8}px)`;
  }

  // const divisionLogo = division === '1'
  //   ? require('../images/RLL_logo.png')
  //   : require('../images/RLL_logo_lower.png');

  return (
    <Grid container alignItems="center" justify="flex-start">
      {/* eslint-disable-next-line no-nested-ternary */}
      <Grid item xs={upcomingOverview ? 12 : gamesPlayed > 3 ? 8 : 9}>
        <Grid container spacing={0} direction="column" alignItems="flex-start" justify="flex-start">
          <Grid item xs>
            <Grid container spacing={0} direction="row" alignItems="center" justify="space-between">
              <Avatar src={team1.logo} variant="square" />
              <Typography variant="h6" className={classes.teamRank}>
                {team1.rank}
              </Typography>
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
            <Grid container spacing={0} direction="row" alignItems="center" justify="space-between">
              <Avatar src={team2.logo} variant="square" />
              <Typography variant="h6" className={classes.teamRank}>
                {team2.rank}
              </Typography>
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

      {!upcomingOverview && (
        <Grid item xs={gamesPlayed > 3 ? 4 : 3}>
          {hasScores ? (
            <Link to={`/schedule/${matchId}`} exact>
              <Grid container spacing={0} direction="column" alignItems="flex-start" justify="flex-start">
                <Grid container justify="space-between">
                  <Grid item xs={gameCellSize}>
                    <Typography variant="h5" className={classes.teamName} style={{ color: homeWinnerA ? 'whitesmoke' : '#8e8e8e' }}>
                      {homeScoreA}
                    </Typography>
                  </Grid>
                  {(!!parseInt(homeScoreB, 10) || !!parseInt(awayScoreB, 10)) && (
                    <Grid item xs={gameCellSize}>
                      <Typography variant="h5" className={classes.teamName} style={{ color: homeWinnerB ? 'whitesmoke' : '#8e8e8e' }}>
                        {homeScoreB}
                      </Typography>
                    </Grid>
                  )}
                  {(isPlayoffs && (!!parseInt(homeScoreC, 10) || !!parseInt(awayScoreC, 10))) && (
                    <Grid item xs={gameCellSize}>
                      <Typography variant="h5" className={classes.teamName} style={{ color: homeWinnerC ? 'whitesmoke' : '#8e8e8e' }}>
                        {homeScoreC}
                      </Typography>
                    </Grid>
                  )}
                  {(isPlayoffs && (!!parseInt(homeScoreD, 10) || !!parseInt(awayScoreD, 10))) && (
                    <Grid item xs={gameCellSize}>
                      <Typography variant="h5" className={classes.teamName} style={{ color: homeWinnerD ? 'whitesmoke' : '#8e8e8e' }}>
                        {homeScoreD}
                      </Typography>
                    </Grid>
                  )}
                  {(isPlayoffs && (!!parseInt(homeScoreE, 10) || !!parseInt(awayScoreE, 10))) && (
                    <Grid item xs={gameCellSize}>
                      <Typography variant="h5" className={classes.teamName} style={{ color: homeWinnerE ? 'whitesmoke' : '#8e8e8e' }}>
                        {homeScoreE}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
                <Grid container justify="space-between">
                  <Grid item xs={gameCellSize}>
                    <Typography variant="h5" className={classes.teamName} style={{ color: !homeWinnerA ? 'whitesmoke' : '#8e8e8e' }}>
                      {awayScoreA}
                    </Typography>
                  </Grid>
                  {(!!parseInt(homeScoreB, 10) || !!parseInt(awayScoreB, 10)) && (
                    <Grid item xs={gameCellSize}>
                      <Typography variant="h5" className={classes.teamName} style={{ color: !homeWinnerB ? 'whitesmoke' : '#8e8e8e' }}>
                        {awayScoreB}
                      </Typography>
                    </Grid>
                  )}
                  {(isPlayoffs && (!!parseInt(homeScoreC, 10) || !!parseInt(awayScoreC, 10))) && (
                    <Grid item xs={gameCellSize}>
                      <Typography variant="h5" className={classes.teamName} style={{ color: !homeWinnerC ? 'whitesmoke' : '#8e8e8e' }}>
                        {awayScoreC}
                      </Typography>
                    </Grid>
                  )}
                  {(isPlayoffs && (!!parseInt(homeScoreD, 10) || !!parseInt(awayScoreD, 10))) && (
                    <Grid item xs={gameCellSize}>
                      <Typography variant="h5" className={classes.teamName} style={{ color: !homeWinnerD ? 'whitesmoke' : '#8e8e8e' }}>
                        {awayScoreD}
                      </Typography>
                    </Grid>
                  )}
                  {(isPlayoffs && (!!parseInt(homeScoreE, 10) || !!parseInt(awayScoreE, 10))) && (
                    <Grid item xs={gameCellSize}>
                      <Typography variant="h5" className={classes.teamName} style={{ color: !homeWinnerE ? 'whitesmoke' : '#8e8e8e' }}>
                        {awayScoreE}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Grid>
            </Link>
          ) : (streamRoom && (
            <Grid container spacing={0} alignItems="center" justify="flex-end">
              <Grid item xs={12}>
                <Typography variant="h5" className={classes.subtitle}>
                  {streamRoom}
                </Typography>
              </Grid>
            </Grid>
          ))}
        </Grid>
      )}
      {(gameTime && gameLocation) && (
        <Grid container justify="flex-end" alignItems="flex-end">
          <Grid item xs={12}>
            <Typography className={classes.subtitle} style={{ marginTop: -12, float: 'right', paddingRight: 8 }}>
              {`${gameTime} | ${gameLocation}`}
            </Typography>
          </Grid>
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
  matchId: PropTypes.string,
  time: PropTypes.string,
  arena: PropTypes.string,
  matchResult: PropTypes.string,
  matchComplete: PropTypes.bool,
  isPlayoffs: PropTypes.bool,
  homeScoreA: PropTypes.string,
  homeScoreB: PropTypes.string,
  homeScoreC: PropTypes.string,
  homeScoreD: PropTypes.string,
  homeScoreE: PropTypes.string,
  awayScoreA: PropTypes.string,
  awayScoreB: PropTypes.string,
  awayScoreC: PropTypes.string,
  awayScoreD: PropTypes.string,
  awayScoreE: PropTypes.string,
  upcomingOverview: PropTypes.bool,
  streamRoom: PropTypes.string,
};
GameCardCompact.defaultProps = {
  matchId: '',
  time: '',
  arena: '',
  matchResult: '-',
  matchComplete: false,
  isPlayoffs: false,
  homeScoreA: '0',
  homeScoreB: '0',
  homeScoreC: '0',
  homeScoreD: '0',
  homeScoreE: '0',
  awayScoreA: '0',
  awayScoreB: '0',
  awayScoreC: '0',
  awayScoreD: '0',
  awayScoreE: '0',
  upcomingOverview: false,
  streamRoom: '',
};

export default GameCardCompact;
