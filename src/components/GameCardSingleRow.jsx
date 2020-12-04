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
    color: theme.otherColors.text.dark,
    fontStyle: 'italic',
  },
  teamRecord: {
    color: 'whitesmoke',
    textShadow: '0px 0px 2px black',
  },
  teamRank: {
    color: 'whitesmoke',
    textShadow: '1px 1px 2px black',
  },
}));

/**
 * GAME OBJECT: { id: 1, homeTeam: 1, awayTeam: 2, gameTime: '05/29/2020 7:30PM CT', arena: 'Salty Shores', }
 *
 */
function GameCardSingleRow(props) {
  const {
    gameNum,
    team1,
    team2,
    time,
    arena,
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
  } = props;
  const classes = useStyles();

  const timeAsDate = new Date(time);
  let gameTime = time;
  if ((timeAsDate instanceof Date && !Number.isNaN(timeAsDate))) { // time is a valid date, we can format it as such
    gameTime = timeAsDate.toLocaleString() + timezoneLookup(new Date().getTimezoneOffset());
  }
  const gameLocation = arena;

  let gamesPlayed = 2;
  if (parseInt(homeScoreE, 10) || parseInt(awayScoreE, 10)) {
    gamesPlayed = 5;
  } else if (parseInt(homeScoreD, 10) || parseInt(awayScoreD, 10)) {
    gamesPlayed = 4;
  } else if (parseInt(homeScoreC, 10) || parseInt(awayScoreC, 10)) {
    gamesPlayed = 3;
  }
  const gameCellSize = Math.floor(12 / gamesPlayed);

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
  let homeWinnerD = false;
  let homeWinnerE = false;
  let homeWinnerOverall = false;
  let awayWinnerOverall = false;
  if (hasScores) {
    homeWinnerA = parseInt(homeScoreA, 10) > parseInt(awayScoreA, 10);
    homeWinnerB = parseInt(homeScoreB, 10) > parseInt(awayScoreB, 10);
    homeWinnerC = parseInt(homeScoreC, 10) > parseInt(awayScoreC, 10);
    homeWinnerD = parseInt(homeScoreD, 10) > parseInt(awayScoreD, 10);
    homeWinnerE = parseInt(homeScoreE, 10) > parseInt(awayScoreE, 10);

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

  const homeStyle = {};
  const awayStyle = {};
  if (homeWinnerOverall) {
    homeStyle.color = '#8e8e8e';
    if (isPlayoffs) awayStyle.textDecoration = 'line-through';
  } else if (awayWinnerOverall) {
    awayStyle.color = '#8e8e8e';
    if (isPlayoffs) homeStyle.textDecoration = 'line-through';
  }

  if (team1.name.length > 14) {
    homeStyle.letterSpacing = `calc(0.05vw - ${team1.name.length / 8}px)`;
  }
  if (team2.name.length > 14) {
    awayStyle.letterSpacing = `calc(0.05vw - ${team2.name.length / 8}px)`;
  }

  const rowStyle = {};
  rowStyle.borderLeft = '1px solid black';
  rowStyle.borderRight = '1px solid black';
  rowStyle.borderBottom = gameNum % 2 ? 'none' : '1px solid black';
  rowStyle.borderTop = gameNum % 2 ? '1px solid black' : 'none';
  rowStyle.marginBottom = gameNum % 2 ? 'none' : '8px';
  rowStyle.backgroundColor = gameNum % 2 ? 'inherit' : '#616161';

  return (
    <Grid container alignItems="center" justify="flex-start" style={rowStyle}>
      <Grid item xs={5}>
        <Grid container spacing={2} direction="row" alignItems="center" justify="flex-start">
          <Grid item xs>
            <Typography variant="h4" className={classes.teamRank}>
              <Grid container spacing={0} direction="row" alignItems="flex-start" justify="space-around">
                {team1.rank}
                <Avatar src={team1.logo} variant="square" />
              </Grid>
            </Typography>
          </Grid>
          <Grid item xs>
            <Grid container spacing={0} direction="row-reverse" alignItems="center" justify="flex-start">
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
        </Grid>
      </Grid>
      {(gameTime && gameLocation) && (
        <Grid item xs={2}>
          <Typography className={classes.subtitle}>
            {(gameNum % 2) ? `${gameTime.split(' ')[1]} ${gameTime.split(' ')[2]}` : ''}
          </Typography>
        </Grid>
      )}
      <Grid item xs={5}>
        <Grid container spacing={2} direction="row-reverse" alignItems="center" justify="flex-start">
          <Grid item xs>
            <Typography variant="h4" className={classes.teamRank}>
              <Grid container spacing={0} direction="row" alignItems="flex-start" justify="space-around">
                <Avatar src={team2.logo} variant="square" />
                {team2.rank}
              </Grid>
            </Typography>
          </Grid>
          <Grid item xs>
            <Grid container spacing={0} direction="row" alignItems="center" justify="flex-start">
              <Link to={`/teams/${team2.name}`} exact>
                <Typography variant="h5" className={classes.teamName} style={homeStyle}>
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

      {/* {hasScores && (
        <Grid item xs={gamesPlayed > 3 ? 4 : 3}>
          <Grid container spacing={0} direction="column" alignItems="flex-start" justify="flex-start">
            <Grid container justify="space-between">
              <Grid item xs={gameCellSize}>
                <Typography variant="h5" className={classes.teamName} style={homeWinnerA ? { color: '#8e8e8e' } : null}>
                  {homeScoreA}
                </Typography>
              </Grid>
              <Grid item xs={gameCellSize}>
                <Typography variant="h5" className={classes.teamName} style={homeWinnerB ? { color: '#8e8e8e' } : null}>
                  {homeScoreB}
                </Typography>
              </Grid>
              {(isPlayoffs && (!!parseInt(homeScoreC, 10) || !!parseInt(awayScoreC, 10))) && (
                <Grid item xs={gameCellSize}>
                  <Typography variant="h5" className={classes.teamName} style={homeWinnerC ? { color: '#8e8e8e' } : null}>
                    {homeScoreC}
                  </Typography>
                </Grid>
              )}
              {(isPlayoffs && (!!parseInt(homeScoreD, 10) || !!parseInt(awayScoreD, 10))) && (
                <Grid item xs={gameCellSize}>
                  <Typography variant="h5" className={classes.teamName} style={homeWinnerD ? { color: '#8e8e8e' } : null}>
                    {homeScoreD}
                  </Typography>
                </Grid>
              )}
              {(isPlayoffs && (!!parseInt(homeScoreE, 10) || !!parseInt(awayScoreE, 10))) && (
                <Grid item xs={gameCellSize}>
                  <Typography variant="h5" className={classes.teamName} style={homeWinnerE ? { color: '#8e8e8e' } : null}>
                    {homeScoreE}
                  </Typography>
                </Grid>
              )}
            </Grid>
            <Grid container justify="space-between">
              <Grid item xs={gameCellSize}>
                <Typography variant="h5" className={classes.teamName} style={!homeWinnerA ? { color: '#8e8e8e' } : null}>
                  {awayScoreA}
                </Typography>
              </Grid>
              <Grid item xs={gameCellSize}>
                <Typography variant="h5" className={classes.teamName} style={!homeWinnerB ? { color: '#8e8e8e' } : null}>
                  {awayScoreB}
                </Typography>
              </Grid>
              {(isPlayoffs && (!!parseInt(homeScoreC, 10) || !!parseInt(awayScoreC, 10))) && (
                <Grid item xs={gameCellSize}>
                  <Typography variant="h5" className={classes.teamName} style={!homeWinnerC ? { color: '#8e8e8e' } : null}>
                    {awayScoreC}
                  </Typography>
                </Grid>
              )}
              {(isPlayoffs && (!!parseInt(homeScoreD, 10) || !!parseInt(awayScoreD, 10))) && (
                <Grid item xs={gameCellSize}>
                  <Typography variant="h5" className={classes.teamName} style={!homeWinnerD ? { color: '#8e8e8e' } : null}>
                    {awayScoreD}
                  </Typography>
                </Grid>
              )}
              {(isPlayoffs && (!!parseInt(homeScoreE, 10) || !!parseInt(awayScoreE, 10))) && (
                <Grid item xs={gameCellSize}>
                  <Typography variant="h5" className={classes.teamName} style={!homeWinnerE ? { color: '#8e8e8e' } : null}>
                    {awayScoreE}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      )} */}
    </Grid>
  );
}

GameCardSingleRow.propTypes = {
  gameNum: PropTypes.number.isRequired,
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
  homeScoreD: PropTypes.string,
  homeScoreE: PropTypes.string,
  awayScoreA: PropTypes.string,
  awayScoreB: PropTypes.string,
  awayScoreC: PropTypes.string,
  awayScoreD: PropTypes.string,
  awayScoreE: PropTypes.string,
};
GameCardSingleRow.defaultProps = {
  time: '',
  arena: '',
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
};

export default GameCardSingleRow;
