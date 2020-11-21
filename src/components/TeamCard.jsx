import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  Grid, Paper, Avatar, Typography, LinearProgress
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import PlayerCard from './PlayerCard';
import PlayerCardMini from './PlayerCardMini';

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    textAlign: 'center',
    backgroundColor: theme.palette.primary.light,
    width: '100%',
  },
  paper: {
    padding: theme.spacing(1),
    margin: theme.spacing(1),
    textAlign: 'center',
    backgroundColor: theme.palette.primary.light,
    width: '100%',
  },
  teamIcon: {
    width: theme.spacing(12),
    height: theme.spacing(12),
  },
  teamName: {
    fontVariant: 'small-caps',
    float: 'left',
    marginLeft: theme.spacing(1),
    color: 'whitesmoke',
    textShadow: '0px 0px 2px black',
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
  teamRecord: {
    fontVariant: 'small-caps',
    fontSize: '1.6em',
    color: 'whitesmoke',
    fontWeight: 700,
    textShadow: '1px 1px 2px black',
  },
  bigRecord: {
    fontSize: '2.5em',
    float: 'left',
    paddingLeft: theme.spacing(2),
    paddingTop: theme.spacing(1),
  },
  teamDetails: {
    fontVariant: 'small-caps',
    fontSize: '1.4em',
    color: '#444444',
  },
}));

function TeamCard(props) {
  const {
    team, inGame, showDetails, winner, totalTeams, gameweeks, winlossdraw,
  } = props;
  const classes = useStyles();
  const defaultLogo = 'DINOBOTS';
  const logoSrc = require(`../images/LOGO_${team.name.toUpperCase() || defaultLogo}.png`); // eslint-disable-line

  const players = team.members;
  let rankSuffix = 'th';
  const numTeams = totalTeams || 8;
  let rankClass = (parseInt(team.rank, 10) === numTeams) ? 'last' : '';
  switch (parseInt(team.rank, 10)) {
    case 1:
      rankSuffix = 'st';
      rankClass = 'first';
      break;
    case 2:
      rankSuffix = 'nd';
      break;
    case 3:
      rankSuffix = 'rd';
      break;
    case 8:
    // eslint-disable-next-line no-fallthrough
    case 4:
    case 5:
    case 6:
    case 7:
    case 9:
    case 0:
    default:
      rankSuffix = 'th';
      break;
  }
  const teamRank = parseInt(team.rank, 10) === numTeams ? 'Last' : `${team.rank}${rankSuffix}`;

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

        return {
          name: oppTeam,
          logo: oppLogoSrc,
        };
        // return (
        //   <Avatar src={oppLogoSrc} variant="square" />
        // );
      });
      const curWeekResultsObj = curWeekResults.map((wld) => {
        const result = wld.split(':')[2];
        return (
        // eslint-disable-next-line no-nested-ternary
          <Typography variant="h5" style={result === 'W' ? { color: 'green' } : result === 'L' ? { color: '#8e0000' } : result === 'D' ? { color: 'blue' } : { color: 'inherit' }}>{result}</Typography>
        );
      });
      seasonOverview.push((
        <Grid item xs={gridSizePerWeek}>
          <Grid container direction="column" justify="center" alignItems="center">
            {showDetails && <Typography variant="h4" style={{ color: '#383838' }}>{curWeek}</Typography>}
            <Grid container direction="row" justify="space-around" alignItems="center">
              {curWeekOppObj.map((opp) => (
                <Link to={`/teams/${opp.name}`} exact>
                  <Avatar src={opp.logo} variant="square" />
                </Link>
              ))}
            </Grid>
            <Grid container direction="row" justify="space-around" alignItems="center">
              {curWeekResultsObj}
            </Grid>
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
        <Grid container alignItems="center" justify="space-between">
          <Grid item xs={2}>
            <Avatar src={logoSrc} variant="square" className={classes.teamIcon} style={!inGame ? { paddingLeft: 24 } : {}} />
          </Grid>
          <Grid item xs={inGame ? 10 : 4}>
            <Link to={showDetails ? '/teams' : `/teams/${team.name}`} exact>
              <Typography
                variant={showDetails ? 'h2' : 'h3'}
                className={`${classes.teamName} ${showDetails ? classes.bigName : ''}`}
                style={team.name.length > 14 ? { letterSpacing: `calc(0.01vw - ${team.name.length / 5}px)` } : null}
              >
                {team.name}
              </Typography>
            </Link>
          </Grid>
          {showDetails && (
            <>
              <Grid item xs={1}>
                <Typography className={classes.teamDetails}>{`GF: ${team.goalsFor}`}</Typography>
              </Grid>
              <Grid item xs={1}>
                <Typography className={classes.teamDetails}>{`GA: ${team.goalsAgainst}`}</Typography>
              </Grid>
              <Grid item xs={1}>
                <Typography className={classes.teamDetails}>{`+/-: ${team.plusMinus}`}</Typography>
              </Grid>
            </>
          )}
          <Grid item xs={inGame || showDetails ? 12 : 6}>
            <Grid container direction="row">
              <Grid item xs={inGame ? 3 : 2}>
                <Typography variant={showDetails ? 'h5' : 'body1'} className={`${classes.teamRecord} ${showDetails ? classes.bigRecord : ''}`}>
                  {`${team.wins}-${team.losses}`}
                </Typography>
              </Grid>
              <Grid item xs={inGame ? 5 : 4}>
                <Typography className={`${classes.teamDesc} ${showDetails ? classes.bigRecord : ''}`}>
                  <span className={rankClass} style={rankClass === 'last' ? { letterSpacing: 'calc(0.01vw - 1px)' } : null}>{`${teamRank}`}</span>
                  {' '}
                  place
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography className={`${classes.teamDesc} ${showDetails ? classes.bigRecord : ''}`}>
                  {`${team.points} pts`}
                </Typography>
              </Grid>
              {!inGame && (
                <Grid item xs={3}>
                  <Typography className={`${classes.teamDesc} ${showDetails ? classes.bigRecord : ''}`}>
                    {teamValue}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Grid>
          {!inGame && (seasonOverview.length > 0) && (
          <Paper className={classes.paper} style={{ marginBottom: 16 }}>
            {showDetails && <Typography variant="h5" style={{ fontVariant: 'small-caps', marginBottom: 16 }}>Season Overview</Typography>}
            <Grid container direction="row" alignItems="center" justify="space-around">
              {seasonOverview}
            </Grid>
          </Paper>
          )}
          {playersInfo && showDetails ? playersInfo : !inGame && (
            <>
              <Grid container direction="row" justify="space-around">
                {players.map((p) => <PlayerCardMini player={p} />)}
              </Grid>
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
  totalTeams: PropTypes.number,
  gameweeks: PropTypes.array,
  winlossdraw: PropTypes.array,
};
TeamCard.defaultProps = {
  inGame: false,
  showDetails: false,
  winner: false,
  totalTeams: 8,
  gameweeks: [],
  winlossdraw: [],
};

export default TeamCard;
