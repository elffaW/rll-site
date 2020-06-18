import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  Grid, Paper, Avatar, Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import PlayerCard from './PlayerCard';

// import { playersData } from './containers/Players';

const useStyles = makeStyles((theme) => ({
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
    fontSize: '2rem',
  },
  bigName: {
    letterSpacing: 4,
    fontSize: '3rem',
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
  const { team, inGame, showDetails } = props;
  const classes = useStyles();
  const defaultLogo = 'DinoBots';
  const logoSrc = require(`../images/LOGO_${team.name || defaultLogo}.png`); // eslint-disable-line
  const players = team.members;
  let rankSuffix = 'th';
  let rankClass = '';
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
      rankClass = 'last';
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
  const teamRank = parseInt(team.rank, 10) === 8 ? 'Last' : `${team.rank}${rankSuffix}`;

  const playersInfo = inGame ? '' : players.map((member) => (
    <PlayerCard player={member} inTeam={!showDetails} />
  ));

  let colsXS = inGame ? 11 : 12;
  let colsMD = inGame ? false : 6;
  let colsXL = inGame ? false : 3;
  if (showDetails) {
    colsXS = 12;
    colsMD = false;
    colsXL = false;
  }
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
    <Grid item xs={colsXS} md={colsMD} xl={colsXL}>
      <Paper className={classes.paper}>
        <Grid container alignItems="center" justify="flex-start">
          <Grid item xs={showDetails ? 1 : 3} xl={showDetails ? false : 2}>
            <Avatar src={logoSrc} variant="square" className={classes.teamIcon} />
          </Grid>
          <Grid item xs={showDetails ? 8 : 9}>
            <Link to={showDetails ? '/teams' : `/teams/${team.name}`} exact>
              <Typography
                variant={showDetails ? 'h4' : 'h5'}
                className={`${classes.teamName} ${showDetails ? classes.bigName : ''}`}
                style={team.name.length > 14 ? { letterSpacing: `calc(0.01vw - ${team.name.length / 5}px)` } : null}
              >
                {team.name}
              </Typography>
            </Link>
          </Grid>
          {showDetails ? (
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
          ) : ''}
          <Grid item xs={2}>
            <Typography variant={showDetails ? 'h5' : 'body1'} className={`${classes.teamRecord} ${showDetails ? classes.bigRecord : ''}`}>
              {`${team.wins}-${team.losses}`}
            </Typography>
          </Grid>
          <Grid item xs={4}>
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
          <Grid item xs={3}>
            <Typography className={`${classes.teamDesc} ${showDetails ? classes.bigRecord : ''}`}>
              {team.value}
            </Typography>
          </Grid>
          {playersInfo}
        </Grid>
      </Paper>
    </Grid>
  );
}

TeamCard.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  team: PropTypes.object.isRequired,
  inGame: PropTypes.bool,
  showDetails: PropTypes.bool,
};
TeamCard.defaultProps = {
  inGame: false,
  showDetails: false,
};

export default TeamCard;
