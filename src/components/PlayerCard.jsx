import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  Grid, Paper, Avatar, Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

// import { playersData } from './containers/Players';

const useStyles = makeStyles((theme) => ({
  darkPaper: {
    padding: theme.spacing(1),
    margin: theme.spacing(1),
    textAlign: 'center',
    color: theme.otherColors.text.light,
    backgroundColor: theme.palette.primary.dark,
  },
  playerIcon: {
    width: '100%',
    height: '100%',
    float: 'left',
  },
  playerName: {
    fontVariant: 'small-caps',
    color: 'whitesmoke',
    float: 'left',
  },
  playerTitle: {
    fontVariant: 'small-caps',
    color: theme.palette.primary.light,
    float: 'left',
  },
  playerSecondaryTitle: {
    fontSize: '0.8em',
  },
  playerInfo: {
    float: 'left',
    marginLeft: theme.spacing(2),
  },
  playerDetails: {
    float: 'right',
  },
  playerExtras: {
    fontVariant: 'small-caps',
    color: theme.palette.primary.light,
    float: 'left',
  },
}));

const defaultProps = {
  inTeam: false,
  showDetails: false,
};

/**
 * Player Object in DB:
 * {
 *  id,
 *  name,
 *  rlName,
 *  team,
 *  car,
 *  signingValue,
 *  primaryRole,
 *  secondaryRole,
 *  score,
 *  goals,
 *  assists,
 *  saves,
 *  shots,
 *  numMVP,
 *  points,
 *  gamesPlayed,
 * }
 */
function PlayerCard(props) {
  const { player, inTeam, showDetails } = props;
  const classes = useStyles();
  const playerCar = player.car ? player.car : 'MERC'; // hopefully everyone has a car, but want to avoid undefined require errors on next line...
  const logoSrc = require(`../images/CAR_${playerCar}.png`); // eslint-disable-line
  const playerValue = player.value ? parseFloat(player.value).toFixed(1) : '??';
  const scorePerGame = (parseInt(player.score, 10) / parseInt(player.gamesPlayed, 10)).toFixed(2);
  const { team } = player;
  let teamLogo = 'DinoBots';
  if (team && team.name) {
    teamLogo = team.name;
  }
  const teamLogoSrc = require(`../images/LOGO_${teamLogo}.png`); // eslint-disable-line
  return (
    <Grid item xs={12}>
      <Paper className={classes.darkPaper}>
        <Grid container alignItems="flex-start" justify="flex-start">
          {inTeam ? '' : (
            <Grid item xs={1}>
              <Avatar src={teamLogoSrc} className={classes.playerIcon} />
            </Grid>
          )}
          <Grid item xs={inTeam ? 2 : 1}>
            <Avatar src={logoSrc} className={classes.playerIcon} />
          </Grid>
          <Grid item xs={inTeam ? 4 : 3}>
            <span className={classes.playerInfo}>
              <Link to={showDetails ? '/players' : `/players/${player.name}`} exact>
                <Typography variant="h5" className={classes.playerName}>{player.name}</Typography>
              </Link>
              <br />
              <Typography variant="h6" className={classes.playerTitle}>
                {player.primaryRole}
                &nbsp;&nbsp;
                <span className={classes.playerSecondaryTitle}>{player.secondaryRole}</span>
              </Typography>
              {inTeam || !player.rlName ? '' : (
                <>
                  <br />
                  <Typography variant="h6" className={classes.playerTitle}>{player.rlName}</Typography>
                </>
              )}
            </span>
          </Grid>
          <Grid item xs={inTeam ? 3 : 2}>
            <span className={classes.playerDetails}>
              <Typography variant="h5" className={classes.playerName}>{`${player.points}pts`}</Typography>
              <br />
              <Typography variant="h6" className={classes.playerTitle}>{`${player.goals}G  ${player.assists}A`}</Typography>
              {inTeam ? '' : (
                <>
                  <br />
                  <Typography variant="h6" className={classes.playerTitle}>{`MVPs: ${player.numMVP}`}</Typography>
                </>
              )}
            </span>
          </Grid>
          <Grid item xs={inTeam ? 3 : 2}>
            <span className={classes.playerDetails}>
              <Typography variant="h5" className={classes.playerName}>{`$${playerValue}M`}</Typography>
              <br />
              <Typography variant="h6" className={classes.playerTitle}>{`Score: ${player.score}`}</Typography>
              {inTeam ? '' : (
                <>
                  <br />
                  <Typography variant="h6" className={classes.playerTitle}>{`Avg: ${scorePerGame}`}</Typography>
                </>
              )}
            </span>
          </Grid>
          {inTeam ? '' : (
            <Grid item xs={3}>
              <span className={classes.playerDetails}>
                <Typography variant="h6" className={classes.playerExtras}>{`Signed for: $${player.signingValue}M`}</Typography>
                <br />
                <Typography variant="h6" className={classes.playerExtras}>{`SV: ${player.saves} SH: ${player.shots}`}</Typography>
                <br />
                <Typography variant="h6" className={classes.playerExtras}>{`Games played: ${player.gamesPlayed}`}</Typography>
              </span>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Grid>
  );
}

PlayerCard.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  player: PropTypes.object.isRequired,
  inTeam: PropTypes.bool,
  showDetails: PropTypes.bool,
};
PlayerCard.defaultProps = defaultProps;

export default PlayerCard;
