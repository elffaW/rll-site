import React from 'react';
import PropTypes from 'prop-types';
import {
  Grid, Paper, Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import TeamCard from './TeamCard';

import { timezoneLookup } from './utils/dateUtils';
// import { teamsData } from './containers/Teams';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(1),
    margin: theme.spacing(1),
    textAlign: 'center',
    backgroundColor: theme.palette.primary.light,
    width: '100%',
  },
  darkPaper: {
    padding: theme.spacing(1),
    margin: theme.spacing(1),
    textAlign: 'center',
    color: theme.otherColors.text.light,
    backgroundColor: theme.palette.primary.dark,
  },
  darkerPaper: {
    padding: theme.spacing(1),
    margin: theme.spacing(1),
    textAlign: 'center',
    color: theme.otherColors.text.light,
    backgroundColor: theme.otherColors.background.dark,
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
  const { game } = props;
  const classes = useStyles();

  const home = game.homeTeam;
  const away = game.awayTeam;

  // const homeLogo = require(`../images/LOGO_${home.name}.png`);
  // const awayLogo = require(`../images/LOGO_${away.name}.png`);

  const gameTime = new Date(game.gameTime).toLocaleString() + timezoneLookup(new Date().getTimezoneOffset());

  const gameComplete = !!game.homeTeamScoreA && !!game.homeTeamScoreB && !!game.awayTeamScoreA && !!game.awayTeamScoreB;

  let homeWinnerA = false;
  let homeWinnerB = false;
  let homeWinnerOverall = false;
  let awayWinnerOverall = false;
  if (gameComplete) {
    homeWinnerA = parseInt(game.homeTeamScoreA, 10) > parseInt(game.awayTeamScoreA, 10);
    homeWinnerB = parseInt(game.homeTeamScoreB, 10) > parseInt(game.awayTeamScoreB, 10);

    homeWinnerOverall = homeWinnerA && homeWinnerB;
    awayWinnerOverall = !homeWinnerA && !homeWinnerB;
  }

  // id: 1, homeTeam: 1, awayTeam: 2, gameTime: '05/29/2020 7:30PM CT', arena: 'Salty Shores',
  return (
    <Grid item xs={12}>
      <Paper className={gameComplete ? classes.darkerPaper : classes.darkPaper}>
        <Grid container alignItems="center" justify="space-around">
          <Grid item xs={gameComplete ? 4 : 5}>
            <TeamCard team={home} inGame winner={homeWinnerOverall} />
          </Grid>
          {gameComplete ? (
            <Grid item xs={1}>
              <span className={classes.matchScoreHome}>
                <Typography variant="h6" className={classes.gameScoreHome}>Scores</Typography>
                <br />
                <Typography variant="h5" className={classes.gameScoreHome} style={!homeWinnerA ? { color: '#8e8e8e' } : null}>
                  {`Gm A: ${game.homeTeamScoreA}`}
                </Typography>
                <br />
                <Typography variant="h5" className={classes.gameScoreHome} style={!homeWinnerB ? { color: '#8e8e8e' } : null}>
                  {`Gm B: ${game.homeTeamScoreB}`}
                </Typography>
              </span>
            </Grid>
          ) : ''}
          <Grid item xs={2}>
            {gameComplete ? <Typography variant="h5" className={classes.completeStamp}>COMPLETE</Typography> : ''}
            <Typography variant="h4" className={classes.gameName} style={gameComplete ? { color: '#d0d0d0' } : null}>{`Match ${game.id}`}</Typography>
            <Typography variant="h6" className={classes.gameDesc} style={gameComplete ? { color: '#a0a0a0' } : null}>{gameTime}</Typography>
            <Typography variant="subtitle1" className={classes.gameArena} style={gameComplete ? { color: '#a0a0a0' } : null}>{game.arena}</Typography>
          </Grid>
          {gameComplete ? (
            <Grid item xs={1}>
              <span className={classes.matchScoreAway}>
                <Typography variant="h6" className={classes.gameScoreAway}>Scores</Typography>
                <br />
                <Typography variant="h5" className={classes.gameScoreAway} style={homeWinnerA ? { color: '#8e8e8e' } : null}>
                  {`Gm A: ${game.awayTeamScoreA}`}
                </Typography>
                <br />
                <Typography variant="h5" className={classes.gameScoreAway} style={homeWinnerB ? { color: '#8e8e8e' } : null}>
                  {`Gm B: ${game.awayTeamScoreB}`}
                </Typography>
              </span>
            </Grid>
          ) : ''}
          <Grid item xs={gameComplete ? 4 : 5}>
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
};

export default GameCard;
