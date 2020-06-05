import React from 'react';
import PropTypes from 'prop-types';
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
}));

function TeamCard(props) {
  const { team, inGame } = props;
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
  const teamRank = parseInt(team.rank, 10) === 8 ? 'LAST' : `${team.rank}${rankSuffix}`;

  const playersInfo = inGame ? '' : players.map((member) => (
    <PlayerCard player={member} inTeam />
  ));

  const colsXS = inGame ? 11 : 6;
  const colsXL = inGame ? false : 3;
  return (
    <Grid item xs={colsXS} xl={colsXL}>
      <Paper className={classes.paper}>
        <Grid container alignItems="center" justify="flex-start">
          <Grid item xs={3} xl={2}>
            <Avatar src={logoSrc} className={classes.teamIcon} />
          </Grid>
          <Grid item xs={9}>
            <Typography variant="h5" className={classes.teamName}>{team.name}</Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography className={classes.teamRecord}>{`${team.wins} - ${team.losses}`}</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography className={classes.teamDesc}>
              <span className={rankClass}>{`${teamRank}`}</span>
              {' '}
              place
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography className={classes.teamDesc}>{`${team.points} pts`}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography className={classes.teamDesc}>{team.value}</Typography>
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
};
TeamCard.defaultProps = {
  inGame: false,
};

export default TeamCard;
