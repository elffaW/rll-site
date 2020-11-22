import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  Typography, Avatar, Grid, Tooltip,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  playerRow: {
    marginBottom: theme.spacing(1),
  },
  playerName: {
    zIndex: 99,
    color: theme.otherColors.text.dark,
    fontVariant: 'small-caps',
    fontWeight: 700,
    textShadow: '1px 1px 1px white',
    paddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(1),
  },
  nameLink: {
    color: 'inherit',
    textDecoration: 'inherit',
  },
  playerInfo: {
    zIndex: 99,
    fontVariant: 'small-caps',
    fontWeight: 100,
    paddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(1),
  },
  playerPosition: {
    zIndex: 99,
    fontVariant: 'small-caps',
    fontWeight: 400,
    color: 'whitesmoke',
    paddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    textShadow: '0 0 5px black',
  },
  carIcon: {
    zIndex: 99,
    width: theme.spacing(7),
    paddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(1),
  }
}));

export default function PlayerCardMini(props) {
  const { player } = props;
  const classes = useStyles();

  const playerCar = player.car ? player.car : 'MERC'; // hopefully everyone has a car, but want to avoid undefined require errors on next line...
  const logoSrc = require(`../images/CAR_${playerCar}.png`); // eslint-disable-line
  const playerValue = player.value ? parseFloat(player.value).toFixed(1) : '??';
  const scorePerGame = (parseInt(player.score, 10) / parseInt(player.gamesPlayed, 10)).toFixed(0);

  return (
    <Grid item xs={4}>
      <Grid container className={classes.playerRow} alignItems="center" justify="center" direction="row">
        <Tooltip title={playerCar}>
          <Avatar className={classes.carIcon} src={logoSrc} variant="square" />
        </Tooltip>
        {player.position && (
          <Typography
            variant="h5"
            className={classes.playerPosition}
          >
            {player.position[0]}
          </Typography>
        )}
        <Typography
          variant="h4"
          className={classes.playerName}
        >
          <Link to={`/players/${player.name}`} className={classes.nameLink} exact>
            {player.name}
          </Link>
        </Typography>
        <Typography
          variant="h5"
          className={classes.playerInfo}
        >
          {`$${playerValue}M`}
        </Typography>
      </Grid>
    </Grid>
  );
}

PlayerCardMini.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  player: PropTypes.object.isRequired,
};
