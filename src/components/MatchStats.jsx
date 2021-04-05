import React from 'react';
import PropTypes from 'prop-types';
import {
  Typography, Avatar, Grid,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import GameStatsPlayersOverview from './GameStatsPlayersOverview';
import { convertSpeedToMPH } from './utils/dataUtils';

import div1 from '../images/RLL_logo.png';
import div2 from '../images/RLL_logo_lower.png';

const useStyles = makeStyles((theme) => ({
  matchInfo: {
    zIndex: 99,
    fontVariant: 'small-caps',
    fontWeight: 700,
    paddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    color: 'whitesmoke',
    textShadow: '1px 1px 4px black',
  },
  divisionIcon: {
    zIndex: 99,
    paddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(1),
  },
}));

export default function MatchStats(props) {
  const { match } = props;
  const classes = useStyles();

  const {
    homeTeamName, awayTeamName, curDivision, games, id, seasonStats,
  } = match;

  const playerOverviews = [];
  const gameStats = [];
  const gameHeaders = [];

  const logoSrc = parseInt(curDivision, 10) === 2 ? div2 : div1;

  let oldFormat = false;
  if (!match.games) {
    oldFormat = true;
    const {
      playerStats, homeTeam, awayTeam, numGames,
    } = match;

    const homeName = homeTeam.name;
    const awayName = awayTeam.name;

    const baseId = (id * numGames) - 1;

    Object.keys(gameToLetterMap).forEach((gameOffset) => {
      if (match[`homeTeamScore${gameToLetterMap[gameOffset]}`] && match[`awayTeamScore${gameToLetterMap[gameOffset]}`]) {
        const curStats = playerStats.filter(
          (p) => parseInt(p.gameId, 10) === (parseInt(baseId, 10) + parseInt(gameOffset, 10)),
        );
        if (curStats && curStats.length > 0) {
          const gameObj = {
            playerStats: curStats,
            homeTeamScore: match[`homeTeamScore${gameToLetterMap[gameOffset]}`],
            awayTeamScore: match[`awayTeamScore${gameToLetterMap[gameOffset]}`]
          };
          playerOverviews.push(
            <GameStatsPlayersOverview
              game={gameObj}
              homeTeamName={homeName}
              awayTeamName={awayName}
              curDivision={-1}
            />
          );

          gameHeaders.push(
            <>
              <Grid item xs={5}>
                <Typography
                  variant="h3"
                  className={classes.matchInfo}
                >
                  {game.homeTeamScore}
                </Typography>
              </Grid>
              <Grid item>
                <Avatar className={classes.divisionIcon} src={logoSrc} variant="square" />
              </Grid>
              <Grid item xs={5}>
                <Typography
                  variant="h3"
                  className={classes.matchInfo}
                >
                  {game.awayTeamScore}
                </Typography>
              </Grid>
            </>
          );
        }
      }
    });
  } else if (match.games.length > 0) {
    games.forEach((game) => {
      gameHeaders.push(
        <>
          <Grid item xs={5}>
            <Typography
              variant="h3"
              className={classes.matchInfo}
            >
              {game.homeTeamScore}
            </Typography>
          </Grid>
          <Grid item>
            <Avatar className={classes.divisionIcon} src={logoSrc} variant="square" />
          </Grid>
          <Grid item xs={5}>
            <Typography
              variant="h3"
              className={classes.matchInfo}
            >
              {game.awayTeamScore}
            </Typography>
          </Grid>
        </>
      );
      playerOverviews.push(
        <GameStatsPlayersOverview
          game={game}
          homeTeamName={homeTeamName}
          awayTeamName={awayTeamName}
          curDivision={curDivision}
          matchId={id}
        />
      );
      console.log(game);
      gameStats.push(
        <Grid item>
          <Grid container alignItems="center" justify="center" direction="row">
            <Grid item xs>
              <p>{`BALL SPEED vs Season Avg: ${convertSpeedToMPH(game.avgBallSpeed)} MPH / ${convertSpeedToMPH(seasonStats.avgBallSpeed)} MPH`}</p>
            </Grid>
          </Grid>
        </Grid>
      );
    });
  }

  return (
    <>
      {playerOverviews.map((playerOverview, idx) => (
        <>
          {gameHeaders[idx]}
          {gameStats[idx]}
          {playerOverview}
        </>
      ))}
    </>
  );
}

MatchStats.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  match: PropTypes.object.isRequired,
};
