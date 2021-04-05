import React from 'react';
import PropTypes from 'prop-types';
import {
  Typography, Avatar, Grid, LinearProgress,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import GameStatsPlayersOverview from './GameStatsPlayersOverview';
import StatBoxVsAvg from './StatBoxVsAvg';
import { convertSpeedToMPH } from './utils/dataUtils';

import div1 from '../images/RLL_logo.png';
import div2 from '../images/RLL_logo_lower.png';
import ballspeed from '../images/ballspeed.png';

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
  statIcon: {
    filter: 'invert(100%)',
    paddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(1),
  },
  statText: {
    fontVariant: 'small-caps',
  },
  statBar: {
    minHeight: theme.spacing(1),
    width: '100%',
  },
  statBarValue: {
    marginTop: -theme.spacing(0.5),
  },
  statBarText: {
    marginTop: -theme.spacing(2),
  },
}));

/**
 * mapping used for old format games (S1-S4)
 */
const gameToLetterMap = {
  0: 'A',
  1: 'B',
  2: 'C',
  3: 'D',
  4: 'E',
};

export default function MatchStats(props) {
  const { match } = props;
  const classes = useStyles();

  const {
    homeTeamName, awayTeamName, curDivision, games, id, seasonAverages, seasonExtremes,
  } = match;

  const playerOverviews = [];
  const gameStats = [];
  const gameHeaders = [];

  const logoSrc = parseInt(curDivision, 10) === 2 ? div2 : div1;

  // let oldFormat = false;
  if (!match.games) {
    // oldFormat = true;
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
          const homeScore = match[`homeTeamScore${gameToLetterMap[gameOffset]}`];
          const awayScore = match[`awayTeamScore${gameToLetterMap[gameOffset]}`];
          const gameObj = {
            playerStats: curStats,
            homeTeamScore: match[`homeTeamScore${gameToLetterMap[gameOffset]}`],
            awayTeamScore: match[`awayTeamScore${gameToLetterMap[gameOffset]}`],
          };
          playerOverviews.push(
            <GameStatsPlayersOverview
              game={gameObj}
              homeTeamName={homeName}
              awayTeamName={awayName}
              curDivision={-1}
            />,
          );

          gameHeaders.push(
            <>
              <Grid item xs={5}>
                <Typography
                  variant="h3"
                  className={classes.matchInfo}
                >
                  {homeScore}
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
                  {awayScore}
                </Typography>
              </Grid>
            </>,
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
            {game.probablyOT && <Typography variant="h4">OT</Typography>}
          </Grid>
          <Grid item xs={5}>
            <Typography
              variant="h3"
              className={classes.matchInfo}
            >
              {game.awayTeamScore}
            </Typography>
          </Grid>
        </>,
      );
      playerOverviews.push(
        <GameStatsPlayersOverview
          game={game}
          homeTeamName={homeTeamName}
          awayTeamName={awayTeamName}
          curDivision={curDivision}
          matchId={id}
        />,
      );
      // game stats vs season averages
      let ballSpeedRelative = 100;
      let neutPossRelative = 100;
      let aerialsRelative = 100;
      const {
        minBallSpeed,
        maxBallSpeed,
        maxNeutPoss,
        minNeutPoss,
        maxAerials,
        minAerials,
      } = seasonExtremes;
      if (minBallSpeed !== undefined && maxBallSpeed !== undefined && game.avgBallSpeed !== undefined) {
        ballSpeedRelative = ((game.avgBallSpeed - minBallSpeed) / (maxBallSpeed - minBallSpeed)) * 100;
      }
      if (minNeutPoss !== undefined && maxNeutPoss !== undefined && game.neutralPossessionTime !== undefined) {
        neutPossRelative = ((game.neutralPossessionTime - minNeutPoss) / (maxNeutPoss - minNeutPoss)) * 100;
      }
      if (minAerials !== undefined && maxAerials !== undefined && game.totalAerials !== undefined) {
        aerialsRelative = ((game.totalAerials - minAerials) / (maxAerials - minAerials)) * 100;
      }
      gameStats.push(
        <Grid item xs={12}>
          <Grid container spacing={2} alignItems="center" justify="space-evenly" direction="row">
            <Grid item xs={12}>
              <Typography>
                GAME STATS
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <StatBoxVsAvg
                logo={ballspeed}
                value={convertSpeedToMPH(game.avgBallSpeed)}
                unit="mph"
                avgValue={convertSpeedToMPH(seasonAverages.ballSpeed)}
                minValue={convertSpeedToMPH(minBallSpeed)}
                maxValue={convertSpeedToMPH(maxBallSpeed)}
                statName="Ball Speed"
              />
            </Grid>
            <Grid item xs={4}>
              <StatBoxVsAvg
                logo={ballspeed}
                value={(game.neutralPossessionTime || 0).toFixed(1)}
                unit="s"
                avgValue={(seasonAverages.neutralPossessionTime || 0).toFixed(1)}
                minValue={(minNeutPoss || 0).toFixed(0)}
                maxValue={(maxNeutPoss || 0).toFixed(0)}
                statName="Neutral Possession Time"
              />
            </Grid>
            <Grid item xs={4}>
              <StatBoxVsAvg
                logo={ballspeed}
                value={game.totalAerials}
                unit=""
                avgValue={(seasonAverages.totalAerials || 0).toFixed(1)}
                minValue={(minAerials || 0).toFixed(0)}
                maxValue={(maxAerials || 0).toFixed(0)}
                statName="Total Aerials"
              />
            </Grid>
          </Grid>
        </Grid>,
      );
    });
  }

  return (
    <>
      {playerOverviews.map((playerOverview, idx) => (
        <Grid container direction="row" alignItems="center" justify="space-evenly">
          {gameHeaders[idx]}
          {gameStats[idx]}
          <Grid item xs={12}>
            <Typography>
              PLAYER STATS
            </Typography>
          </Grid>
          {playerOverview}
        </Grid>
      ))}
    </>
  );
}

MatchStats.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  match: PropTypes.object.isRequired,
};
