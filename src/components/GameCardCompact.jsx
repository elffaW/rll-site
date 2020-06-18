import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  Grid, Typography, Avatar,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { timezoneLookup } from './utils/dateUtils';

const useStyles = makeStyles((theme) => ({
  darkPaper: {
    textAlign: 'center',
    color: theme.otherColors.text.light,
    backgroundColor: theme.palette.primary.dark,
  },
  teamName: {
    fontVariant: 'small-caps',
    float: 'left',
    color: 'rgba(0, 0, 0, 0.87)',
  },
  subtitle: {
    fontVariant: 'small-caps',
    color: theme.palette.primary.light,
  },
}));

/**
 * GAME OBJECT: { id: 1, homeTeam: 1, awayTeam: 2, gameTime: '05/29/2020 7:30PM CT', arena: 'Salty Shores', }
 *
 */
function GameCardCompact(props) {
  const {
    team1,
    team2,
    time,
    arena,
    isPlayoffs,
    homeScoreA,
    homeScoreB,
    homeScoreC,
    awayScoreA,
    awayScoreB,
    awayScoreC,
  } = props;
  const classes = useStyles();

  const gameTime = time ? new Date(time).toLocaleString() + timezoneLookup(new Date().getTimezoneOffset()) : '';
  const gameLocation = arena;

  // truthiness of 0 is false, so hasScores is true if any score is non-zero
  const hasScores = !!(parseInt(homeScoreA, 10)
                    || parseInt(awayScoreA, 10)
                    || parseInt(homeScoreB, 10)
                    || parseInt(awayScoreB, 10)
                    || parseInt(homeScoreC, 10)
                    || parseInt(awayScoreC, 10));

  return (
    <Grid container alignItems="center" justify="flex-start">
      <Grid item xs={2}>
        <Grid container spacing={0} direction="column" alignItems="flex-start" justify="flex-start">
          <Grid item xs>
            <Typography variant="h4">
              <Grid container spacing={0} direction="row" alignItems="flex-start" justify="space-around">
                {team1.rank}
                <Avatar src={team1.logo} variant="square" />
              </Grid>
            </Typography>
          </Grid>
          <Grid item xs>
            <Typography variant="h4">
              <Grid container spacing={0} direction="row" alignItems="flex-start" justify="space-around">
                {team2.rank}
                <Avatar src={team2.logo} variant="square" />
              </Grid>
            </Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={7}>
        <Grid container spacing={0} direction="column" alignItems="flex-start" justify="flex-start">
          <Grid item xs>
            <Grid container spacing={0} direction="row" alignItems="flex-start" justify="space-around">
              <Link to={`/teams/${team1.name}`} exact>
                <Typography variant="h5" className={classes.teamName}>
                  {team1.name}
                </Typography>
              </Link>
              <Typography variant="body1" className={classes.teamRecord}>
                {`${team1.wins}-${team1.losses}`}
              </Typography>
            </Grid>
          </Grid>
          <Grid item xs>
            <Grid container spacing={0} direction="row" alignItems="flex-start" justify="space-around">
              <Link to={`/teams/${team2.name}`} exact>
                <Typography variant="h5" className={classes.teamName}>
                  {team2.name}
                </Typography>
              </Link>
              <Typography variant="body1" className={classes.teamRecord}>
                {`${team2.wins}-${team2.losses}`}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {hasScores && (
        <Grid item xs={3}>
          <Grid container spacing={0} direction="column" alignItems="flex-start" justify="flex-start">
            <Grid container justify="space-between">
              <Grid item xs={4}>
                <Typography variant="h5" className={classes.teamName}>
                  {homeScoreA}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="h5" className={classes.teamName}>
                  {homeScoreB}
                </Typography>
              </Grid>
              {isPlayoffs && (
                <Grid item xs={4}>
                  <Typography variant="h5" className={classes.teamName}>
                    {homeScoreC}
                  </Typography>
                </Grid>
              )}
            </Grid>
            <Grid container justify="space-between">
              <Grid item xs={4}>
                <Typography variant="h5" className={classes.teamName}>
                  {awayScoreA}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="h5" className={classes.teamName}>
                  {awayScoreB}
                </Typography>
              </Grid>
              {isPlayoffs && (
                <Grid item xs={4}>
                  <Typography variant="h5" className={classes.teamName}>
                    {awayScoreC}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      )}
      {(gameTime && gameLocation) && (
        <Grid item xs={12}>
          <Typography className={classes.subtitle} style={{ marginTop: -12, float: 'right', paddingRight: 8 }}>
            {`${gameTime} | ${gameLocation}`}
          </Typography>
        </Grid>
      )}
    </Grid>
  );
}

GameCardCompact.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  team1: PropTypes.object.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  team2: PropTypes.object.isRequired,
  time: PropTypes.string,
  arena: PropTypes.string,
  isPlayoffs: PropTypes.bool,
  homeScoreA: PropTypes.string,
  homeScoreB: PropTypes.string,
  homeScoreC: PropTypes.string,
  awayScoreA: PropTypes.string,
  awayScoreB: PropTypes.string,
  awayScoreC: PropTypes.string,
};
GameCardCompact.defaultProps = {
  time: '',
  arena: '',
  isPlayoffs: false,
  homeScoreA: '0',
  homeScoreB: '0',
  homeScoreC: '0',
  awayScoreA: '0',
  awayScoreB: '0',
  awayScoreC: '0',
};

export default GameCardCompact;
