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
}));

function GameCard(props) {
  const { game } = props;
  const classes = useStyles();

  const home = game.homeTeam;
  const away = game.awayTeam;

  // const homeLogo = require(`../images/LOGO_${home.name}.png`);
  // const awayLogo = require(`../images/LOGO_${away.name}.png`);

  const gameTime = new Date(game.gameTime).toLocaleString() + timezoneLookup(new Date().getTimezoneOffset());


  // id: 1, homeTeam: 1, awayTeam: 2, gameTime: '05/29/2020 7:30PM CT', arena: 'Salty Shores',
  return (
    <Grid item xs={12}>
      <Paper className={classes.darkPaper}>
        <Grid container alignItems="center" justify="space-around">
          <Grid item xs={5}>
            <TeamCard team={home} inGame />
          </Grid>
          <Grid item xs={2}>
            <Typography variant="h4" className={classes.gameName}>{`Game ${game.id}`}</Typography>
            <Typography variant="h6" className={classes.gameDesc}>{gameTime}</Typography>
            <Typography variant="subtitle1" className={classes.gameArena}>{game.arena}</Typography>
          </Grid>
          <Grid item xs={5}>
            <TeamCard team={away} inGame className={classes.awayCard} />
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
