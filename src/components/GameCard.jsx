import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  Grid, Paper, Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import TeamCard from './TeamCard';

import { timezoneLookup } from './utils/dateUtils';
// import { teamsData } from './containers/Teams';

const useStyles = makeStyles((theme) => ({
  paper: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    margin: theme.spacing(1),
    textAlign: 'center',
    backgroundColor: theme.palette.primary.light,
    width: '100%',
  },
  darkPaper: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    marginTop: theme.spacing(1),
    marginRight: -theme.spacing(1), // negative margin to counter the accordion spacing
    marginBottom: theme.spacing(1),
    marginLeft: -theme.spacing(1), // negative margin to counter the accordion spacing
    textAlign: 'center',
    color: theme.otherColors.text.light,
    backgroundColor: theme.palette.primary.main,
  },
  darkerPaper: {
    padding: theme.spacing(1),
    marginTop: theme.spacing(1),
    marginRight: -theme.spacing(1), // negative margin to counter the accordion spacing
    marginBottom: theme.spacing(1),
    marginLeft: -theme.spacing(1), // negative margin to counter the accordion spacing
    textAlign: 'center',
    color: theme.otherColors.text.light,
    backgroundColor: theme.palette.primary.darker,
  },
  gameIcon: {
    width: theme.spacing(12),
    height: theme.spacing(12),
  },
  gameName: {
    fontVariant: 'small-caps',
    color: 'whitesmoke',
  },
  gameDesc: {
    fontVariant: 'small-caps',
    fontSize: '1.6em',
    lineHeight: 1,
  },
  gameArena: {
    fontVariant: 'small-caps',
    fontSize: '1.6em',
    lineHeight: 1,
    fontStyle: 'italic',
  },
  gameStreamRoom: {
    fontVariant: 'small-caps',
    color: 'black',
    fontSize: '1.6em',
    lineHeight: 1,
  },
  awayCard: {
    marginLeft: theme.spacing(2),
  },
  gameScoreAway: {
    fontVariant: 'small-caps',
    float: 'right',
    color: theme.otherColors.text.light,
  },
  gameScoreHome: {
    fontVariant: 'small-caps',
    float: 'left',
    color: theme.otherColors.text.light,
  },
  matchScoreAway: {
    color: 'black',
    float: 'left',
  },
  matchScoreHome: {
    color: 'black',
    float: 'right',
  },
  completeStamp: {
    fontVariant: 'small-caps',
    color: '#fcd207',
  },
}));

function GameCard(props) {
  const { game, showDetails } = props;
  const classes = useStyles();

  const home = game.homeTeam;
  const away = game.awayTeam;
  const {
    homeTeamScoreA,
    homeTeamScoreB,
    homeTeamScoreC,
    homeTeamScoreD,
    homeTeamScoreE,
    awayTeamScoreA,
    awayTeamScoreB,
    awayTeamScoreC,
    awayTeamScoreD,
    awayTeamScoreE,
    games,
  } = game;

  // const homeLogo = require(`../images/LOGO_${home.name.toUpperCase()}.png`);
  // const awayLogo = require(`../images/LOGO_${away.name.toUpperCase()}.png`);

  const gameTime = new Date(game.gameTime).toLocaleString() + timezoneLookup(new Date().getTimezoneOffset());

  const isOldGameFormat = homeTeamScoreA !== undefined && awayTeamScoreA !== undefined;
  const gameComplete = isOldGameFormat
    ? !!game.homeTeamScoreA && !!game.homeTeamScoreB && !!game.awayTeamScoreA && !!game.awayTeamScoreB
    : game.matchComplete;

  let gamesPlayed = 1;
  if (homeTeamScoreA === undefined && awayTeamScoreA === undefined) {
    gamesPlayed = games.length;
  } else if (parseInt(homeTeamScoreE, 10) || parseInt(awayTeamScoreE, 10)) {
    gamesPlayed = 5;
  } else if (parseInt(homeTeamScoreD, 10) || parseInt(awayTeamScoreD, 10)) {
    gamesPlayed = 4;
  } else if (parseInt(homeTeamScoreC, 10) || parseInt(awayTeamScoreC, 10)) {
    gamesPlayed = 3;
  } else if (parseInt(homeTeamScoreB, 10) || parseInt(awayTeamScoreB, 10)) {
    gamesPlayed = 2;
  }

  let homeWinnerA = false;
  let homeWinnerB = false;
  let homeWinnerC = false;
  let homeWinnerD = false;
  let homeWinnerE = false;
  let homeWinnerOverall = false;
  let awayWinnerOverall = false;
  if (gameComplete && game.matchResult && !isOldGameFormat) {
    homeWinnerOverall = game.matchResult === 'W';
    awayWinnerOverall = game.matchResult === 'L';
    if (gamesPlayed > 4) {
      homeWinnerE = games[4].homeWin;
    }
    if (gamesPlayed > 3) {
      homeWinnerD = games[3].homeWin;
    }
    if (gamesPlayed > 2) {
      homeWinnerC = games[2].homeWin;
    }
    if (gamesPlayed > 1) {
      homeWinnerB = games[1].homeWin;
    }
    homeWinnerA = games[0].homeWin;
  } else if (gameComplete && isOldGameFormat) {
    homeWinnerA = parseInt(homeTeamScoreA, 10) > parseInt(awayTeamScoreA, 10);
    homeWinnerB = parseInt(homeTeamScoreB, 10) > parseInt(awayTeamScoreB, 10);
    homeWinnerC = parseInt(homeTeamScoreC, 10) > parseInt(awayTeamScoreC, 10);
    homeWinnerD = parseInt(homeTeamScoreD, 10) > parseInt(awayTeamScoreD, 10);
    homeWinnerE = parseInt(homeTeamScoreE, 10) > parseInt(awayTeamScoreE, 10);

    homeWinnerOverall = homeWinnerA && homeWinnerB;
    awayWinnerOverall = !homeWinnerA && !homeWinnerB;
  }

  let division = -1;
  if (!isOldGameFormat) {
    division = parseInt(game.curDivision, 10);
  }

  // id: 1, homeTeam: 1, awayTeam: 2, gameTime: '05/29/2020 7:30PM CT', arena: 'Salty Shores',
  return (
    <Grid item xs={12}>
      <Paper className={`${gameComplete ? classes.darkerPaper : classes.darkPaper} ${division > 0 ? `game-with-division-${division}` : ''}`}>
        <Grid container alignItems="center" justify="space-around">
          <Grid item xs={gameComplete ? 4 : 5} style={!gameComplete ? { paddingRight: 8 } : null}>
            <TeamCard team={home} inGame winner={homeWinnerOverall} />
          </Grid>
          {gameComplete ? (
            <Grid item xs={1}>
              <span className={classes.matchScoreHome}>
                <Typography variant="h6" className={classes.gameScoreHome}>Scores</Typography>
                <br />
                <Typography variant="h5" className={classes.gameScoreHome} style={!homeWinnerA ? { color: '#8e8e8e' } : null}>
                  {`Gm A: ${isOldGameFormat ? homeTeamScoreA : games[0].homeTeamScore}`}
                </Typography>
                <br />
                {gamesPlayed > 1 && (
                  <Typography variant="h5" className={classes.gameScoreHome} style={!homeWinnerB ? { color: '#8e8e8e' } : null}>
                    {`Gm B: ${isOldGameFormat ? homeTeamScoreB : games[1].homeTeamScore}`}
                  </Typography>
                )}
                <br />
                {gamesPlayed > 2 && (
                  <Typography variant="h5" className={classes.gameScoreHome} style={!homeWinnerC ? { color: '#8e8e8e' } : null}>
                    {`Gm C: ${isOldGameFormat ? homeTeamScoreC : games[2].homeTeamScore}`}
                  </Typography>
                )}
              </span>
            </Grid>
          ) : ''}
          <Grid item xs={2}>
            {gameComplete ? <Typography variant="h5" className={classes.completeStamp}>COMPLETE</Typography> : ''}
            <Link to={!showDetails ? `/schedule/${game.id}` : '/schedule/'} exact>
              <Typography variant="h4" className={classes.gameName} style={gameComplete ? { color: '#d0d0d0' } : null}>
                {`Match ${game.id}`}
              </Typography>
            </Link>
            <Typography variant="h6" className={classes.gameDesc} style={gameComplete ? { color: '#a0a0a0' } : null}>
              {gameTime}
            </Typography>
            <Typography variant="subtitle1" className={classes.gameStreamRoom} style={gameComplete ? { color: '#d0d0d0' } : null}>
              {game.streamRoom}
            </Typography>
            <Typography variant="subtitle1" className={classes.gameArena} style={gameComplete ? { color: '#a0a0a0' } : null}>
              {game.arena}
            </Typography>
          </Grid>
          {gameComplete ? (
            <Grid item xs={1}>
              <span className={classes.matchScoreAway}>
                <Typography variant="h6" className={classes.gameScoreAway}>Scores</Typography>
                <br />
                <Typography variant="h5" className={classes.gameScoreAway} style={homeWinnerA ? { color: '#8e8e8e' } : null}>
                  {`Gm A: ${isOldGameFormat ? awayTeamScoreA : games[0].awayTeamScore}`}
                </Typography>
                <br />
                {gamesPlayed > 1 && (
                  <Typography variant="h5" className={classes.gameScoreAway} style={homeWinnerB ? { color: '#8e8e8e' } : null}>
                    {`Gm B: ${isOldGameFormat ? awayTeamScoreB : games[1].awayTeamScore}`}
                  </Typography>
                )}
                <br />
                {gamesPlayed > 2 && (
                  <Typography variant="h5" className={classes.gameScoreAway} style={homeWinnerC ? { color: '#8e8e8e' } : null}>
                    {`Gm B: ${isOldGameFormat ? awayTeamScoreC : games[2].awayTeamScore}`}
                  </Typography>
                )}
              </span>
            </Grid>
          ) : ''}
          <Grid item xs={gameComplete ? 4 : 5} style={!gameComplete ? { paddingLeft: 8 } : null}>
            <TeamCard team={away} inGame className={classes.awayCard} winner={awayWinnerOverall} />
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
}

GameCard.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  game: PropTypes.object.isRequired,
  showDetails: PropTypes.bool,
};
GameCard.defaultProps = {
  showDetails: false,
};

export default GameCard;
