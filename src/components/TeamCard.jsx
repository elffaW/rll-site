import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  Grid, Paper, Avatar, Typography, LinearProgress, Tooltip,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import PlayerCard from './PlayerCard';
import PlayerCardMini from './PlayerCardMini';

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    textAlign: 'center',
    backgroundColor: theme.palette.primary.light,
    width: '100%',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  paper: {
    padding: theme.spacing(1),
    margin: theme.spacing(1),
    textAlign: 'center',
    backgroundColor: theme.palette.primary.light,
    width: '100%',
  },
  teamIcon: {
    width: `min(100%, ${theme.spacing(10)}px)`,
    height: `min(100%, ${theme.spacing(10)}px)`,
  },
  teamTrophy: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    float: 'right',
    paddingLeft: theme.spacing(1),
  },
  champTrophy: {
    filter: 'invert(70%) sepia(41%) saturate(1219%) hue-rotate(359deg) brightness(114%) contrast(110%)',
  },
  runnerUpTrophy: {
    filter: 'invert(90%) sepia(0%) saturate(1063%) hue-rotate(140deg) brightness(87%) contrast(88%)',
  },
  teamName: {
    fontVariant: 'small-caps',
    float: 'left',
    marginLeft: theme.spacing(1),
    color: 'whitesmoke',
    fontWeight: 700,
    textShadow: '1px 1px 2px black',
  },
  bigName: {
    letterSpacing: 4,
    fontSize: '3rem',
    fontWeight: 400,
  },
  teamDesc: {
    fontVariant: 'small-caps',
    fontSize: '1.6em',
    '& > span.first': {
      color: 'gold',
    },
    '& > span.last': {
      color: theme.palette.secondary.dark,
    },
  },
  teamRank: {
    fontSize: '4rem',
    fontWeight: 700,
    color: 'whitesmoke',
    textShadow: '1px 1px 2px black',
  },
  teamRecord: {
    fontVariant: 'small-caps',
    fontSize: '1.6em',
    color: 'whitesmoke',
    paddingLeft: theme.spacing(1),
    textShadow: '0px 0px 2px black',
  },
  bigRecord: {
    fontSize: '2.5em',
    float: 'left',
  },
  teamDetails: {
    fontVariant: 'small-caps',
    fontSize: '1.4em',
    color: '#444444',
  },
  oppIcon: {
    filter: 'grayscale(75%)',
  },
  playerBar: {
    width: '100%',
    height: theme.spacing(8),
    opacity: '20%',
    marginTop: -theme.spacing(8),
  },
}));

function TeamCard(props) {
  const {
    team, inGame, showDetails, winner, gameweeks, winlossdraw,
  } = props;
  const classes = useStyles();

  /* eslint-disable global-require */
  const champLogo = require('../images/CHAMPION.png');
  const runnerUpLogo = require('../images/RUNNERUP.png');
  // for promotion/relegation style season where future games may not know specific teams yet
  if (!team || !team.name) {
    const upperLowerSplit = 5;
    let logoSrc = require('../images/RLL_logo.png');
    if (team.rank > upperLowerSplit) {
      logoSrc = require('../images/RLL_logo_lower.png');
    }
    /* eslint-enable global-require */
    return (
      <Grid item xs={12}>
        <Paper className={showDetails ? classes.paper : classes.mainPaper}>
          <Grid container alignItems="center" justify="flex-start">
            <Grid item xs={inGame ? 2 : 1}>
              <Typography variant="h2" className={`${classes.teamDesc} ${classes.teamRank}`}>
                {team.rank}
              </Typography>
            </Grid>
            <Grid item xs={inGame ? 2 : 1}>
              <Avatar src={logoSrc} variant="square" className={classes.teamIcon} />
            </Grid>
            <Grid item xs={inGame ? 8 : 4}>
              <Grid container alignItems="flex-end" justify="flex-start" direction="row">
                <Grid item>
                  <Typography
                    variant={showDetails ? 'h2' : 'h4'}
                    className={`${classes.teamName} ${showDetails ? classes.bigName : ''}`}
                  >
                    TBD
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    );
  }
  const defaultLogo = 'DINOBOTS';
  const logoSrc = require(`../images/LOGO_${team?.name?.toUpperCase?.() || defaultLogo}.png`); // eslint-disable-line

  const players = team.members;

  const playersInfo = !inGame && players.map((member) => (
    <PlayerCard player={member} inTeam={!showDetails} />
  ));

  const gridSizePerWeek = Math.floor(12 / gameweeks.length);
  const seasonOverview = [];
  if (winlossdraw && gameweeks) {
    for (let i = 0; i < gameweeks.length; i++) {
      const curWeek = gameweeks[i];
      const curWeekResults = winlossdraw.filter((wld) => parseInt(wld.split(':')[0], 10) === parseInt(curWeek, 10));

      const curWeekOppObj = curWeekResults.map((wld) => {
        const oppTeam = wld.split(':')[1];
        const oppLogoSrc = require(`../images/LOGO_${oppTeam || defaultLogo}.png`); // eslint-disable-line
        const gameId = wld.split(':')[2];
        const result = wld.slice(-1);

        let oppLogoStyle = { backgroundColor: 'gray', filter: 'saturate(50%)' };
        if (result === 'W') {
          oppLogoStyle = { backgroundColor: 'green', filter: 'saturate(50%)' };
        } else if (result === 'L') {
          oppLogoStyle = { backgroundColor: 'red', filter: 'saturate(50%)' };
        } else if (result === 'D') {
          oppLogoStyle = { backgroundColor: 'blue', filter: 'saturate(50%)' };
        }

        return {
          name: oppTeam,
          logo: oppLogoSrc,
          style: oppLogoStyle,
          gameId,
          result,
        };
      });
      // const curWeekResultsObj = curWeekResults.map((wld) => {
      //   const result = wld.split(':')[2];
      //   return (
      //   // eslint-disable-next-line no-nested-ternary
      //     <Typography variant="h5" style={result === 'W' ? { color: 'green' } : result === 'L' ? { color: '#8e0000' } : result === 'D' ? { color: 'blue' } : { color: 'inherit' }}>{result}</Typography>
      //   );
      // });
      seasonOverview.push((
        <Grid item xs={gridSizePerWeek}>
          <Grid container direction="column" justify="center" alignItems="center">
            {showDetails && <Typography variant="h4" style={{ color: '#383838' }}>{curWeek}</Typography>}
            <Grid container direction="row" justify="space-around" alignItems="center">
              {curWeekOppObj.map((opp) => (
                <Link to={`/schedule/${opp.gameId}`} exact>
                  <Tooltip title={`${opp.result} (${opp.name})`}>
                    <Avatar src={opp.logo} variant="circle" style={opp.style} />
                  </Tooltip>
                </Link>
              ))}
            </Grid>
            {/* <Grid container direction="row" justify="space-around" alignItems="center">
              {curWeekResultsObj}
            </Grid> */}
          </Grid>
        </Grid>
      ));
    }
  }

  let teamValue = team.value;
  if (!teamValue) {
    teamValue = '$';
    teamValue += players.map((p) => parseFloat(p.value)).reduce((accum, cur) => accum + cur).toFixed(2);
    teamValue += 'M';
  }
  if (teamValue.indexOf('$') < 0) {
    teamValue = `$${teamValue}M`;
  }

  const totalValue = players.map((p) => parseFloat(p.value)).reduce((accum, cur) => accum + cur);
  const p1 = players[0];
  const p2 = players[1];
  const player1Pct = (parseFloat(p1.value) / totalValue) * 100;
  const player2Pct = ((parseFloat(p1.value) + parseFloat(p2.value)) / totalValue) * 100;

  /**
   * show:
   * - name
   * - members
   * - rank
   * - win/loss
   * - points
   * - value
   * if showDetails then also show:
   * - plusMinus
   * - goals for
   * - goals against
   */
  return (
    <Grid item xs={12}>
      <Paper className={showDetails ? classes.paper : classes.mainPaper} style={winner ? { boxShadow: 'inset 0 0 0.75rem gold' } : null}>
        <Grid container alignItems="center" justify="flex-start">
          <Grid item xs={inGame ? 2 : 1}>
            <Avatar src={logoSrc} variant="square" className={classes.teamIcon} />
          </Grid>
          <Grid item xs={inGame ? 10 : 5}>
            <Grid container alignItems="flex-end" justify="flex-start" direction="row">
              <Grid item>
                <Link to={showDetails ? '/teams' : `/teams/${team.name}`} exact>
                  <Typography variant="h6" className={classes.teamName}>
                    {team.rank}
                  </Typography>
                  <Typography
                    variant={showDetails ? 'h2' : 'h4'}
                    className={`${classes.teamName} ${showDetails ? classes.bigName : ''}`}
                    style={team.name.length > 14 ? { letterSpacing: `calc(0.01vw - ${team.name.length / 5}px)` } : null}
                  >
                    {team.name}
                  </Typography>
                </Link>
              </Grid>
              <Grid item>
                <Typography variant={showDetails ? 'h5' : 'body1'} className={classes.teamRecord}>
                  {`${team.wins}-${team.losses}`}
                </Typography>
              </Grid>
              <Grid item>
                {team.isChampion && (
                  <Avatar src={champLogo} variant="square" className={`${classes.teamTrophy} ${classes.champTrophy}`} />
                )}
                {team.isRunnerUp && (
                  <Avatar src={runnerUpLogo} variant="square" className={`${classes.teamTrophy} ${classes.runnerUpTrophy}`} />
                )}
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={inGame ? 12 : 6}>
            <Grid container alignItems="flex-start" justify="center" direction="row">
              <Grid item xs={inGame ? true : 4}>
                <Typography className={classes.teamDetails}>{`GF: ${team.goalsFor}`}</Typography>
              </Grid>
              <Grid item xs={inGame ? true : 4}>
                <Typography className={classes.teamDetails}>{`GA: ${team.goalsAgainst}`}</Typography>
              </Grid>
              <Grid item xs={inGame ? true : 4}>
                <Typography className={classes.teamDetails}>{`+/-: ${team.plusMinus}`}</Typography>
              </Grid>
              <Grid item xs={inGame ? true : 6}>
                <Typography className={classes.teamDesc}>
                  {`${team.points} pts`}
                </Typography>
              </Grid>
              {!inGame && (
                <Grid item xs={inGame ? true : 6}>
                  <Typography className={classes.teamDesc}>
                    {teamValue}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Grid>
          {!inGame && (seasonOverview.length > 0) && (
          <Paper className={classes.paper} style={{ marginBottom: 16 }}>
            <Grid container direction="row" alignItems="center" justify="space-around">
              {seasonOverview}
            </Grid>
          </Paper>
          )}
          {playersInfo && showDetails ? playersInfo : !inGame && (
            <>
              <Grid container direction="row" justify="space-between">
                {players.map((p) => <PlayerCardMini player={p} />)}
              </Grid>
              <LinearProgress className={classes.playerBar} color="secondary" variant="buffer" value={player1Pct} valueBuffer={player2Pct} />
              <LinearProgress style={{ width: '100%' }} color="secondary" variant="buffer" value={player1Pct} valueBuffer={player2Pct} />
            </>
          )}
        </Grid>
      </Paper>
    </Grid>
  );
}

TeamCard.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  team: PropTypes.object.isRequired,
  inGame: PropTypes.bool,
  showDetails: PropTypes.bool,
  winner: PropTypes.bool,
  gameweeks: PropTypes.array,
  winlossdraw: PropTypes.array,
};
TeamCard.defaultProps = {
  inGame: false,
  showDetails: false,
  winner: false,
  gameweeks: [],
  winlossdraw: [],
};

export default TeamCard;
