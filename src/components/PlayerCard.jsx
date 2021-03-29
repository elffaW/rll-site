import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  Grid, Paper, Avatar, Typography, Badge, Tooltip, LinearProgress,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  darkPaper: {
    padding: theme.spacing(1),
    margin: theme.spacing(1),
    textAlign: 'center',
    color: theme.otherColors.text.light,
    backgroundColor: theme.otherColors.text.dark,
  },
  playerGrid: {
    zIndex: 99,
    position: 'relative',
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
  systemLogo: {
    float: 'right',
    marginLeft: theme.spacing(1),
    marginTop: 2,
    width: 24,
    height: 24,
  },
  teamTrophy: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    paddingLeft: theme.spacing(1),
  },
  champTrophy: {
    filter: 'invert(70%) sepia(41%) saturate(1219%) hue-rotate(359deg) brightness(114%) contrast(110%)',
  },
  runnerUpTrophy: {
    filter: 'invert(90%) sepia(0%) saturate(1063%) hue-rotate(140deg) brightness(87%) contrast(88%)',
  },
  playerName: {
    fontVariant: 'small-caps',
    color: 'whitesmoke',
    float: 'left',
    textShadow: '0px 0px 2px black',
  },
  playerSubName: {
    fontWeight: 400,
    color: 'whitesmoke !important',
    marginTop: '1.5px',
  },
  playerTitle: {
    fontVariant: 'small-caps',
    color: theme.palette.primary.light,
    float: 'left',
    textAlign: 'end',
  },
  playerChamp: {
    color: 'gold',
    textShadow: '0px 0px 1px black',
  },
  playerRunnerUp: {
    color: 'silver',
    textShadow: '0px 0px 1px black',
  },
  playerSecondaryTitle: {
    fontSize: '0.9em',
  },
  playerPosition: {
    transform: 'rotate(-90deg)',
    marginTop: 6,
    marginLeft: -8,
  },
  playerInfo: {
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
  statsBar: {
    width: '100%',
    height: theme.spacing(11),
    // opacity: '20%',
    marginTop: -theme.spacing(13),
    padding: theme.spacing(1),
    margin: -theme.spacing(1),
    borderRadius: 4,
  },
}));

const defaultProps = {
  inTeam: false,
  showDetails: false,
  statValue: 100,
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
 *  value,
 *  system,
 *  country,
 *  position,
 * }
 */
function PlayerCard(props) {
  const {
    player, inTeam, showDetails, statValue,
  } = props;
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
  const teamLogoSrc = require(`../images/LOGO_${teamLogo.toUpperCase()}.png`); // eslint-disable-line

  /**
   * System:
   * - Robot_icon.svg (bots)
   * - Nintendo_Switch_Logo.svg
   * - PlayStation_logo.svg
   * - Steam_icon_logo.svg (PC)
   * - Xbox_one_logo.svg
   */
  let sysLogo = 'question.png';
  let sysTitle = 'Unknown';
  if (player.system) {
    const sys = player.system.toLowerCase();
    if (sys === 'bot') {
      sysLogo = 'Robot_icon.svg';
      sysTitle = 'BOT';
    } else if (sys.indexOf('switch') > -1) {
      sysLogo = 'Nintendo_Switch_Logo.svg';
      sysTitle = 'Switch';
    } else if (sys.indexOf('pc') > -1 || sys.indexOf('steam') > -1) {
      sysLogo = 'Steam_icon_logo.svg';
      sysTitle = 'PC / Steam';
    } else if (sys.indexOf('ps') > -1 || sys.indexOf('playstation') > -1) {
      sysLogo = 'PlayStation_logo.svg';
      sysTitle = 'PS4';
    } else if (sys.indexOf('x') > -1) {
      sysLogo = 'Xbox_one_logo.svg';
      sysTitle = 'XBox';
    } else {
      sysLogo = 'question.png';
      sysTitle = 'Unknown';
    }
  }


  const champLogo = require('../images/CHAMPION.png'); // eslint-disable-line
  const runnerUpLogo = require('../images/RUNNERUP.png'); // eslint-disable-line
  const sysLogoSrc = require(`../images/${sysLogo}`); // eslint-disable-line
  const robotIcon = require('../images/Robot_icon.svg'); // eslint-disable-line
  return (
    <Grid item xs={12} className={classes.playerCard}>
      <Paper className={classes.darkPaper} style={inTeam ? { maxHeight: 83.25 } : {}}>
        <Grid className={classes.playerGrid} container alignItems="flex-start" justify="flex-start">
          {inTeam ? (
            <Grid item xs={2}>
              <Avatar src={logoSrc} alt={`car ${playerCar}`} className={classes.playerIcon} />
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
                  <Avatar src={logoSrc} alt={`car ${playerCar}`} className={classes.playerIcon} />
                </Tooltip>
              </Badge>
            </Grid>
          )}
          <Grid item xs={4}>
            <Grid container className={classes.playerInfo} direction="column" alignItems="flex-start" justify="flex-end">
              <span>
                <Typography variant="h6" className={`${classes.playerTitle} ${classes.playerSecondaryTitle} ${classes.playerPosition}`}>
                  {player.position}
                </Typography>
                <Link to={showDetails ? '/players' : `/players/${player.name}`} exact>
                  <Typography variant="h5" className={classes.playerName}>{player.name}</Typography>
                </Link>
                {inTeam || !player.rlName ? '' : (
                  <Typography
                    variant="h6"
                    className={`${classes.playerTitle} ${classes.playerSubName}`}
                    style={player.rlName.length > 15 ? { letterSpacing: 'calc(-2.5px + 0.01vw)' } : null}
                  >
                      &nbsp;&nbsp;
                    {player.rlName}
                  </Typography>
                )}
                {inTeam ? '' : (
                  <>
                    <Tooltip title={sysTitle}>
                      <Avatar
                        src={sysLogoSrc}
                        variant="square"
                        alt="system logo"
                        className={classes.systemLogo}
                        imgProps={{ style: { filter: 'none' } }}
                        component="span"
                      />
                    </Tooltip>
                    {player.name === 'Dan Bot' ? (
                      <Tooltip title="BOT">
                        <Avatar
                          src={robotIcon}
                          variant="square"
                          alt="system logo"
                          className={classes.systemLogo}
                          imgProps={{ style: { filter: 'none' } }}
                          component="span"
                        />
                      </Tooltip>
                    ) : ''}
                  </>
                )}
              </span>
              <br />
              <span>
                <Typography variant="h6" className={`${classes.playerTitle} ${player.isChampion ? classes.playerChamp : ''} ${player.isRunnerUp ? classes.playerRunnerUp : ''}`}>
                  {/* eslint-disable-next-line no-nested-ternary */}
                  {player.isChampion ? 'CHAMPION' : (player.isRunnerUp ? 'RUNNER-UP' : '')}
                </Typography>
                {player.isChampion && (
                  <Avatar src={champLogo} variant="square" className={`${classes.teamTrophy} ${classes.champTrophy}`} />
                )}
                {player.isRunnerUp && (
                  <Avatar src={runnerUpLogo} variant="square" className={`${classes.teamTrophy} ${classes.runnerUpTrophy}`} />
                )}
              </span>
              <br />
              {player.primaryRole && player.secondaryRole && (
                <Typography variant="h6" className={`${classes.playerTitle} ${classes.playerSecondaryTitle}`}>
                  {`${player.primaryRole} | ${player.secondaryRole}`}
                </Typography>
              )}
            </Grid>
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
        <LinearProgress variant="determinate" className={`${classes.statsBar} progress-stat-bar`} color="secondary" value={statValue} />
      </Paper>
    </Grid>
  );
}

PlayerCard.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  player: PropTypes.object.isRequired,
  inTeam: PropTypes.bool,
  showDetails: PropTypes.bool,
  statValue: PropTypes.number,
};
PlayerCard.defaultProps = defaultProps;

export default PlayerCard;
