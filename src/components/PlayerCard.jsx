import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  Grid, Paper, Avatar, Typography, Badge, Tooltip,
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
  playerCard: {
    paddingTop: '0px !important',
    paddingBottom: '0px !important',
  },
  playerIcon: {
    width: '100%',
    height: '100%',
    maxWidth: 110,
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
    textAlign: 'end',
  },
  playerSecondaryTitle: {
    fontSize: '0.8em',
  },
  playerInfo: {
    float: 'left',
    paddingLeft: theme.spacing(4),
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
    <Grid item xs={12} className={classes.playerCard}>
      <Paper className={classes.darkPaper} style={inTeam ? { maxHeight: 83.25 } : {}}>
        <Grid container alignItems="flex-start" justify="flex-start">
          {inTeam ? (
            <Grid item xs={2}>
              <Avatar src={logoSrc} alt={playerCar} className={classes.playerIcon} />
            </Grid>
          ) : (
            <Grid item xs={1}>
              <Badge
                overlap="circle"
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                badgeContent={(
                  <Tooltip title={teamLogo}>
                    <Link to={`/teams/${teamLogo}`} exact>
                      <Avatar src={teamLogoSrc} variant="square" alt={teamLogo} />
                    </Link>
                  </Tooltip>
                )}
              >
                <Tooltip title={playerCar}>
                  <Avatar src={logoSrc} alt={playerCar} className={classes.playerIcon} />
                </Tooltip>
              </Badge>
            </Grid>
          )}
          <Grid item xs={4}>
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
                  <Typography variant="h6" className={classes.playerTitle}>{`$/pt: ${(playerValue / parseInt(player.points, 10)).toFixed(2)}`}</Typography>
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
                <Typography variant="h6" className={classes.playerExtras}>{`Games: ${player.gamesPlayed} MVP: ${player.numMVP}`}</Typography>
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
