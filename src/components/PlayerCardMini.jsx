import React from 'react';
import PropTypes from 'prop-types';
import {
  Typography, Avatar, Grid, Tooltip,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  playerName: {
    fontVariant: 'small-caps',
    fontWeight: 700,
  },
  playerInfo: {
    fontVariant: 'small-caps',
    fontWeight: 100,
  },
  playerPosition: {
    fontVariant: 'small-caps',
    fontWeight: 400,
    color: 'whitesmoke',
  },
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
      <Grid container alignItems="flex-start" justify="center" direction="row">
        <Tooltip title={playerCar}>
          <Avatar src={logoSrc} variant="square" />
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
          {player.name}
        </Typography>
        <Typography
          variant="h5"
          className={classes.playerInfo}
        >
          {`$${playerValue}M [${scorePerGame} PG]`}
        </Typography>
      </Grid>
    </Grid>
  );
}

PlayerCardMini.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  player: PropTypes.object.isRequired,
};
