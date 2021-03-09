import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Grid, Paper, CircularProgress,
} from '@material-ui/core';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import ToggleButton from '@material-ui/lab/ToggleButton';
import { makeStyles } from '@material-ui/core/styles';
import ReactPivot from 'react-pivot';

import api from './utils/api';

const useStyles = makeStyles((theme) => ({
  darkPaper: {
    padding: theme.spacing(1),
    margin: theme.spacing(1),
    textAlign: 'center',
    backgroundColor: theme.otherColors.background.mainDarker,
  },
  statsHeader: {
    fontWeight: 700,
  },
}));

const seasonToTeamSizeMap = {
  1: 2,
  2: 3,
  3: 3,
  4: 3,
  5: 2,
};

function PlayerGameStats(props) {
  const { player, playerName, season } = props;
  const classes = useStyles();
  const [playerStats, setPlayerStats] = useState([]);
  const [statsView, setStatsView] = useState('total');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (playerName === 'ALL_PLAYERS') {
      api.getAllStats().then((allStats) => {
        const statsTemp = allStats.map((stat) => stat.data);
        const stats = statsTemp.map((stat) => {
          const { ...tempStat } = stat;
          tempStat.teamSize = seasonToTeamSizeMap[stat.season] || 3;
          return tempStat;
        });
        console.log(stats);
        console.log(stats.length, 'STATS GAMES RETRIEVED');
        setPlayerStats(stats);
        setLoading(false);
      }).catch((e) => {
        console.error('error with stats API request');
        console.error(e);
      });
    } else {
      api.getStatsByPlayerName(playerName).then((allStats) => {
        const statsTemp = allStats.map((stat) => stat.data);
        const stats = statsTemp.map((stat) => {
          const { ...tempStat } = stat;
          tempStat.teamSize = seasonToTeamSizeMap[stat.season] || 3;
          return tempStat;
        });
        // console.log('got player stats for player and season', player, season);
        // console.log(stats);
        setPlayerStats(stats);
        setLoading(false);
      }).catch((e) => {
        console.error('error with stats by player API request');
        console.error(e);
      });
    }
  }, [player, season]);

  const dimensions = [
    { value: 'id', title: 'Indiv Game' },
    { value: 'teamName', title: 'Team' },
    { value: 'season', title: 'Season' },
    { value: 'opposingTeam', title: 'Opponent' },
    { value: 'statsType', title: 'Match Type' },
    // { value: 'gameWeek', title: 'Gameweek' },
    { value: (row) => (row.playerWin === '1' ? 'W' : 'L'), title: 'Win or Loss' },
    { value: 'teamSize', title: 'Team Size' },
  ];
  if (playerName === 'ALL_PLAYERS') {
    dimensions.push({
      value: 'playerName', title: 'Player',
    });
  }
  const reduce = (row, memo) => {
    /* eslint-disable no-param-reassign */
    memo.count = (memo.count || 0) + 1;
    memo.winsTotal = (memo.winsTotal || 0) + parseFloat(row.playerWin);
    memo.winsAvg = (memo.winsTotal || 0) / (memo.count || 1);
    memo.lossesTotal = (memo.lossesTotal || 0) + parseFloat(row.playerLoss);
    memo.lossesAvg = (memo.lossesTotal || 0) / (memo.count || 1);
    memo.plusMinusTotal = (memo.plusMinusTotal || 0) + (parseFloat(row.teamGoals) - parseFloat(row.opponentGoals));
    memo.plusMinusAvg = (memo.plusMinusTotal || 0) / (memo.count || 1);
    memo.goalsTotal = (memo.goalsTotal || 0) + parseFloat(row.playerGoals);
    memo.goalsAvg = (memo.goalsTotal || 0) / (memo.count || 1);
    memo.assistsTotal = (memo.assistsTotal || 0) + parseFloat(row.playerAssists);
    memo.assistsAvg = (memo.assistsTotal || 0) / (memo.count || 1);
    memo.pointsTotal = (memo.pointsTotal || 0) + parseFloat(row.playerGoals) + parseFloat(row.playerAssists); // derived stat
    memo.pointsAvg = (memo.pointsTotal || 0) / (memo.count || 1);
    memo.savesTotal = (memo.savesTotal || 0) + parseFloat(row.playerSaves);
    memo.savesAvg = (memo.savesTotal || 0) / (memo.count || 1);
    memo.shotsTotal = (memo.shotsTotal || 0) + parseFloat(row.playerShots);
    memo.shotsAvg = (memo.shotsTotal || 0) / (memo.count || 1);
    memo.numMVPTotal = (memo.numMVPTotal || 0) + parseFloat(row.playerMVP);
    memo.numMVPAvg = (memo.numMVPTotal || 0) / (memo.count || 1);
    memo.scoreTotal = (memo.scoreTotal || 0) + parseFloat(row.playerScore);
    memo.scoreAvg = (memo.scoreTotal || 0) / (memo.count || 1);
    // try to calculate better averages for advanced stats by only counting games where adv stats were recorded
    memo.advancedCount = (memo.advancedCount || 0) + +(row.playerTimeInDefendingThird !== undefined);
    memo.semiadvancedCount = (memo.semiadvancedCount || 0) + +(row.playerBallTouches !== undefined);
    memo.boostAdvancedCount = (memo.boostAdvancedCount || 0) + +(row.playerBoostUsage !== undefined);
    // from advanced but added to regular
    memo.numDemosInflicted = (memo.numDemosInflicted || 0) + parseInt(row.playerNumDemosInflicted || 0, 10);
    memo.numDemosTaken = (memo.numDemosTaken || 0) + parseInt(row.playerNumDemosTaken || 0, 10);
    memo.totalClears = (memo.totalClears || 0) + parseInt(row.playerTotalClears || 0, 10);
    memo.totalPasses = (memo.totalPasses || 0) + parseInt(row.playerTotalPasses || 0, 10);
    memo.numDemosInflictedAvg = (memo.numDemosInflicted || 0) / (memo.advancedCount || 1);
    memo.numDemosTakenAvg = (memo.numDemosTaken || 0) / (memo.advancedCount || 1);
    memo.totalClearsAvg = (memo.totalClears || 0) / (memo.advancedCount || 1);
    memo.totalPassesAvg = (memo.totalPasses || 0) / (memo.advancedCount || 1);
    // advanced stats
    memo.scorePercentOfTeam = (memo.scorePercentOfTeam || 0) + parseFloat(row.playerPercentOfTeam);
    // memo.scoreRatingVsTeam = (memo.scoreRatingVsTeam || 0) + parseFloat(row.scoreRatingVsTeam);
    memo.ballTouches = (memo.ballTouches || 0) + parseInt(row.playerBallTouches || 0, 10);
    memo.timeHighInAir = (memo.timeHighInAir || 0) + parseFloat(row.playerTimeHighInAir || 0);
    memo.timeLowInAir = (memo.timeLowInAir || 0) + parseFloat(row.playerTimeLowInAir || 0);
    memo.totalAerials = (memo.totalAerials || 0) + parseInt(row.playerTotalAerials || 0, 10);
    memo.turnovers = (memo.turnovers || 0) + parseInt(row.playerTurnovers || 0, 10);
    memo.takeaways = (memo.takeaways || 0) + parseInt(row.playerTakeaways || 0, 10);
    memo.numKickoffFirstTouch = (memo.numKickoffFirstTouch || 0) + parseInt(row.playerNumTimeFirstTouch || 0, 10);
    memo.numKickoffAfk = (memo.numKickoffAfk || 0) + parseInt(row.playerNumTimeAfk || 0, 10);
    memo.boostUsage = (memo.boostUsage || 0) + parseFloat(row.playerBoostUsage || 0);
    memo.numSmallBoosts = (memo.numSmallBoosts || 0) + parseInt(row.playerNumSmallBoosts || 0, 10);
    memo.numLargeBoosts = (memo.numLargeBoosts || 0) + parseInt(row.playerNumLargeBoosts || 0, 10);
    memo.wastedUsage = (memo.wastedUsage || 0) + parseFloat(row.playerWastedUsage || 0);
    memo.averageBoostLevel = (memo.averageBoostLevel || 0) + parseFloat(row.playerAverageBoostLevel || 0);
    memo.numStolenBoosts = (memo.numStolenBoosts || 0) + parseInt(row.playerNumStolenBoosts || 0, 10);
    memo.averageSpeed = (memo.averageSpeed || 0) + parseFloat(row.playerAverageSpeed || 0);
    memo.averageHitDistance = (memo.averageHitDistance || 0) + parseFloat(row.playerAverageHitDistance || 0);
    memo.timeAtSlowSpeed = (memo.timeAtSlowSpeed || 0) + parseFloat(row.playerTimeAtSlowSpeed || 0);
    memo.timeAtBoostSpeed = (memo.timeAtBoostSpeed || 0) + parseFloat(row.playerTimeAtBoostSpeed || 0);
    memo.timeAtSuperSonic = (memo.timeAtSuperSonic || 0) + parseFloat(row.playerTimeAtSuperSonic || 0);
    memo.timeBallcam = (memo.timeBallcam || 0) + parseFloat(row.playerTimeBallcam || 0);
    memo.timeOnWall = (memo.timeOnWall || 0) + parseFloat(row.playerTimeOnWall || 0);
    memo.timeMostForwardPlayer = (memo.timeMostForwardPlayer || 0) + parseFloat(row.playerTimeMostForwardPlayer || 0);
    memo.timeMostBackPlayer = (memo.timeMostBackPlayer || 0) + parseFloat(row.playerTimeMostBackPlayer || 0);
    memo.timeBetweenPlayers = (memo.timeBetweenPlayers || 0) + parseFloat(row.playerTimeBetweenPlayers || 0);
    memo.timeBehindBall = (memo.timeBehindBall || 0) + parseFloat(row.playerTimeBehindBall || 0);
    memo.timeInFrontBall = (memo.timeInFrontBall || 0) + parseFloat(row.playerTimeInFrontBall || 0);
    memo.ballHitForwardDist = (memo.ballHitForwardDist || 0) + parseFloat(row.playerBallHitForwardDist || 0);
    memo.ballHitBackwardDist = (memo.ballHitBackwardDist || 0) + parseFloat(row.playerBallHitBackwardDist || 0);
    memo.timeCloseToBall = (memo.timeCloseToBall || 0) + parseFloat(row.playerTimeCloseToBall || 0);
    memo.totalCarries = (memo.totalCarries || 0) + parseInt(row.playerTotalCarries || 0, 10);
    memo.totalCarryDistance = (memo.totalCarryDistance || 0) + parseFloat(row.playerTotalCarryDistance || 0);
    memo.totalDribbles = (memo.totalDribbles || 0) + parseInt(row.playerTotalDribbles || 0, 10);
    memo.usefulHits = (memo.usefulHits || 0) + parseInt(row.playerUsefulHits || 0, 10);
    memo.timeInGame = (memo.timeInGame || 0) + parseFloat(row.playerTimeInGame || 0);
    memo.timeInDefendingThird = (memo.timeInDefendingThird || 0) + parseFloat(row.playerTimeInDefendingThird || 0);
    memo.timeInNeutralThird = (memo.timeInNeutralThird || 0) + parseFloat(row.playerTimeInNeutralThird || 0);
    memo.timeInAttackingThird = (memo.timeInAttackingThird || 0) + parseFloat(row.playerTimeInAttackingThird || 0);
    // advanced AVERAGE stats
    memo.scorePercentOfTeamAvg = (memo.scorePercentOfTeam || 0) / (memo.count || 1);
    // memo.scoreRatingVsTeamAvg = (memo.scoreRatingVsTeam || 0) / (memo.count || 1);
    memo.ballTouchesAvg = (memo.ballTouches || 0) / (memo.semiadvancedCount || 1);
    memo.timeHighInAirAvg = (memo.timeHighInAir || 0) / (memo.advancedCount || 1);
    memo.timeLowInAirAvg = (memo.timeLowInAir || 0) / (memo.advancedCount || 1);
    memo.totalAerialsAvg = (memo.totalAerials || 0) / (memo.advancedCount || 1);
    memo.turnoversAvg = (memo.turnovers || 0) / (memo.advancedCount || 1);
    memo.takeawaysAvg = (memo.takeaways || 0) / (memo.advancedCount || 1);
    memo.numKickoffFirstTouchAvg = (memo.numKickoffFirstTouch || 0) / (memo.advancedCount || 1);
    memo.numKickoffAfkAvg = (memo.numKickoffAfk || 0) / (memo.advancedCount || 1);
    memo.boostUsageAvg = (memo.boostUsage || 0) / (memo.boostAdvancedCount || 1);
    memo.numSmallBoostsAvg = (memo.numSmallBoosts || 0) / (memo.boostAdvancedCount || 1);
    memo.numLargeBoostsAvg = (memo.numLargeBoosts || 0) / (memo.boostAdvancedCount || 1);
    memo.wastedUsageAvg = (memo.wastedUsage || 0) / (memo.boostAdvancedCount || 1);
    memo.averageBoostLevelAvg = (memo.averageBoostLevel || 0) / (memo.boostAdvancedCount || 1);
    memo.numStolenBoostsAvg = (memo.numStolenBoosts || 0) / (memo.boostAdvancedCount || 1);
    memo.averageSpeedAvg = (memo.averageSpeed || 0) / (memo.advancedCount || 1);
    memo.averageHitDistanceAvg = (memo.averageHitDistance || 0) / (memo.advancedCount || 1);
    memo.timeAtSlowSpeedAvg = (memo.timeAtSlowSpeed || 0) / (memo.advancedCount || 1);
    memo.timeAtBoostSpeedAvg = (memo.timeAtBoostSpeed || 0) / (memo.advancedCount || 1);
    memo.timeAtSuperSonicAvg = (memo.timeAtSuperSonic || 0) / (memo.advancedCount || 1);
    memo.timeBallcamAvg = (memo.timeBallcam || 0) / (memo.advancedCount || 1);
    memo.timeOnWallAvg = (memo.timeOnWall || 0) / (memo.advancedCount || 1);
    memo.timeMostForwardPlayerAvg = (memo.timeMostForwardPlayer || 0) / (memo.advancedCount || 1);
    memo.timeMostBackPlayerAvg = (memo.timeMostBackPlayer || 0) / (memo.advancedCount || 1);
    memo.timeBetweenPlayersAvg = (memo.timeBetweenPlayers || 0) / (memo.advancedCount || 1);
    memo.timeBehindBallAvg = (memo.timeBehindBall || 0) / (memo.advancedCount || 1);
    memo.timeInFrontBallAvg = (memo.timeInFrontBall || 0) / (memo.advancedCount || 1);
    memo.ballHitForwardDistAvg = (memo.ballHitForwardDist || 0) / (memo.advancedCount || 1);
    memo.ballHitBackwardDistAvg = (memo.ballHitBackwardDist || 0) / (memo.advancedCount || 1);
    memo.timeCloseToBallAvg = (memo.timeCloseToBall || 0) / (memo.advancedCount || 1);
    memo.totalCarriesAvg = (memo.totalCarries || 0) / (memo.advancedCount || 1);
    memo.totalCarryDistanceAvg = (memo.totalCarryDistance || 0) / (memo.advancedCount || 1);
    memo.totalDribblesAvg = (memo.totalDribbles || 0) / (memo.advancedCount || 1);
    memo.usefulHitsAvg = (memo.usefulHits || 0) / (memo.advancedCount || 1);
    memo.timeInGameAvg = (memo.timeInGame || 0) / (memo.advancedCount || 1);
    memo.timeInDefendingThirdAvg = (memo.timeInDefendingThird || 0) / (memo.advancedCount || 1);
    memo.timeInNeutralThirdAvg = (memo.timeInNeutralThird || 0) / (memo.advancedCount || 1);
    memo.timeInAttackingThirdAvg = (memo.timeInAttackingThird || 0) / (memo.advancedCount || 1);
    /* eslint-enable no-param-reassign */
    return memo;
  };
  /* *********************** TOTAL (DEFAULT) *********************** */
  let calculations = [{
    title: 'Games',
    value: 'count',
    template: (val) => val.toFixed(0),
    sortBy: (row) => (Number.isNaN(row.count) ? 0 : row.count),
  }, {
    title: 'Total Goals',
    value: 'goalsTotal',
    template: (val) => val.toFixed(0),
    sortBy: (row) => (Number.isNaN(row.goalsTotal) ? 0 : row.goalsTotal),
  }, {
    title: 'Total Assists',
    value: 'assistsTotal',
    template: (val) => val.toFixed(0),
    sortBy: (row) => (Number.isNaN(row.assistsTotal) ? 0 : row.assistsTotal),
  }, {
    title: 'Total Points',
    value: 'pointsTotal',
    template: (val) => val.toFixed(0),
    sortBy: (row) => (Number.isNaN(row.pointsTotal) ? 0 : row.pointsTotal),
  }, {
    title: 'Total Saves',
    value: 'savesTotal',
    template: (val) => val.toFixed(0),
    sortBy: (row) => (Number.isNaN(row.savesTotal) ? 0 : row.savesTotal),
  }, {
    title: 'Total Shots',
    value: 'shotsTotal',
    template: (val) => val.toFixed(0),
    sortBy: (row) => (Number.isNaN(row.shotsTotal) ? 0 : row.shotsTotal),
  }, {
    title: 'Total MVP',
    value: 'numMVPTotal',
    template: (val) => val.toFixed(0),
    sortBy: (row) => (Number.isNaN(row.numMVPTotal) ? 0 : row.numMVPTotal),
  }, {
    title: 'Demos',
    value: 'numDemosInflicted',
    template: (val) => val.toFixed(0),
    sortBy: (row) => (Number.isNaN(row.numDemosInflicted) ? 0 : row.numDemosInflicted),
  }, {
    title: 'Demoed',
    value: 'numDemosTaken',
    template: (val) => val.toFixed(0),
    sortBy: (row) => (Number.isNaN(row.numDemosTaken) ? 0 : row.numDemosTaken),
  }, {
    title: 'Clears',
    value: 'totalClears',
    template: (val) => val.toFixed(0),
    sortBy: (row) => (Number.isNaN(row.totalClears) ? 0 : row.totalClears),
  }, {
    title: 'Passes',
    value: 'totalPasses',
    template: (val) => val.toFixed(0),
    sortBy: (row) => (Number.isNaN(row.totalPasses) ? 0 : row.totalPasses),
  }, {
    title: 'Total Score',
    value: 'scoreTotal',
    template: (val) => val.toFixed(0),
    sortBy: (row) => (Number.isNaN(row.scoreTotal) ? 0 : row.scoreTotal),
  }, {
    title: '% of Team',
    value: 'scorePercentOfTeamAvg',
    template: (val) => (val * 100).toFixed(0),
    sortBy: (row) => (Number.isNaN(row.scorePercentOfTeamAvg) ? 0 : row.scorePercentOfTeamAvg),
  }, {
    title: 'Total Wins',
    value: 'winsTotal',
    template: (val) => val.toFixed(0),
    sortBy: (row) => (Number.isNaN(row.winsTotal) ? 0 : row.winsTotal),
  }, {
    title: 'Total Losses',
    value: 'lossesTotal',
    template: (val) => val.toFixed(0),
    sortBy: (row) => (Number.isNaN(row.lossesTotal) ? 0 : row.lossesTotal),
  }, {
    title: 'Total +/-',
    value: 'plusMinusTotal',
    template: (val) => val.toFixed(0),
    sortBy: (row) => (Number.isNaN(row.plusMinusTotal) ? 0 : row.plusMinusTotal),
  }];
  /* *********************** AVERAGE *********************** */
  if (statsView === 'avg') {
    calculations = [{
      title: 'Games',
      value: 'count',
      template: (val) => val.toFixed(0),
      sortBy: (row) => (Number.isNaN(row.count) ? 0 : row.count),
    }, {
      title: 'Avg Goals PG',
      value: 'goalsAvg',
      template: (val) => val.toFixed(1),
      sortBy: (row) => (Number.isNaN(row.goalsAvg) ? 0 : row.goalsAvg),
    }, {
      title: 'Avg Assists PG',
      value: 'assistsAvg',
      template: (val) => val.toFixed(1),
      sortBy: (row) => (Number.isNaN(row.assistsAvg) ? 0 : row.assistsAvg),
    }, {
      title: 'Avg Points PG',
      value: 'pointsAvg',
      template: (val) => val.toFixed(1),
      sortBy: (row) => (Number.isNaN(row.pointsAvg) ? 0 : row.pointsAvg),
    }, {
      title: 'Avg Saves PG',
      value: 'savesAvg',
      template: (val) => val.toFixed(1),
      sortBy: (row) => (Number.isNaN(row.savesAvg) ? 0 : row.savesAvg),
    }, {
      title: 'Avg Shots PG',
      value: 'shotsAvg',
      template: (val) => val.toFixed(1),
      sortBy: (row) => (Number.isNaN(row.shotsAvg) ? 0 : row.shotsAvg),
    }, {
      title: 'Avg MVP',
      value: 'numMVPAvg',
      template: (val) => val.toFixed(1),
      sortBy: (row) => (Number.isNaN(row.numMVPAvg) ? 0 : row.numMVPAvg),
    }, {
      title: 'Demos PG',
      value: 'numDemosInflictedAvg',
      template: (val) => val.toFixed(1),
      sortBy: (row) => (Number.isNaN(row.numDemosInflictedAvg) ? 0 : row.numDemosInflictedAvg),
    }, {
      title: 'Demoed PG',
      value: 'numDemosTakenAvg',
      template: (val) => val.toFixed(1),
      sortBy: (row) => (Number.isNaN(row.numDemosTakenAvg) ? 0 : row.numDemosTakenAvg),
    }, {
      title: 'Clears PG',
      value: 'totalClearsAvg',
      template: (val) => val.toFixed(1),
      sortBy: (row) => (Number.isNaN(row.totalClearsAvg) ? 0 : row.totalClearsAvg),
    }, {
      title: 'Passes PG',
      value: 'totalPassesAvg',
      template: (val) => val.toFixed(1),
      sortBy: (row) => (Number.isNaN(row.totalPassesAvg) ? 0 : row.totalPassesAvg),
    }, {
      title: 'Avg Score PG',
      value: 'scoreAvg',
      template: (val) => val.toFixed(1),
      sortBy: (row) => (Number.isNaN(row.scoreAvg) ? 0 : row.scoreAvg),
    }, {
      title: 'Avg % of Team',
      value: 'scorePercentOfTeamAvg',
      template: (val) => (val * 100).toFixed(0),
      sortBy: (row) => (Number.isNaN(row.scorePercentOfTeamAvg) ? 0 : row.scorePercentOfTeamAvg),
    }, {
      title: 'Avg Wins',
      value: 'winsAvg',
      template: (val) => val.toFixed(2),
      sortBy: (row) => (Number.isNaN(row.winsAvg) ? 0 : row.winsAvg),
    }, {
      title: 'Avg Losses',
      value: 'lossesAvg',
      template: (val) => val.toFixed(2),
      sortBy: (row) => (Number.isNaN(row.lossesAvg) ? 0 : row.lossesAvg),
    }, {
      title: 'Avg +/- PG',
      value: 'plusMinusAvg',
      template: (val) => val.toFixed(1),
      sortBy: (row) => (Number.isNaN(row.plusMinusAvg) ? 0 : row.plusMinusAvg),
    }];
  } else if (statsView === 'advanced') {
    /* *********************** ADVANCED (TOTALS) *********************** */
    calculations = [{
      title: 'Games',
      value: 'count',
      template: (val) => val.toFixed(0),
      sortBy: (row) => (Number.isNaN(row.count) ? 0 : row.count),
    }, {
      title: 'Useful Hits',
      value: 'usefulHits',
      template: (val) => val.toFixed(0),
      sortBy: (row) => (Number.isNaN(row.usefulHits) ? 0 : row.usefulHits),
    }, {
      title: 'Touches',
      value: 'ballTouches',
      template: (val) => val.toFixed(0),
      sortBy: (row) => (Number.isNaN(row.ballTouches) ? 0 : row.ballTouches),
    }, {
      title: 'Aerials',
      value: 'totalAerials',
      template: (val) => val.toFixed(0),
      sortBy: (row) => (Number.isNaN(row.totalAerials) ? 0 : row.totalAerials),
    }, {
      title: 'Turnovers',
      value: 'turnovers',
      template: (val) => val.toFixed(0),
      sortBy: (row) => (Number.isNaN(row.turnovers) ? 0 : row.turnovers),
    }, {
      title: 'Takeaways',
      value: 'takeaways',
      template: (val) => val.toFixed(0),
      sortBy: (row) => (Number.isNaN(row.takeaways) ? 0 : row.takeaways),
    }, {
      title: 'First Touch',
      value: 'numKickoffFirstTouch',
      template: (val) => val.toFixed(0),
      sortBy: (row) => (Number.isNaN(row.numKickoffFirstTouch) ? 0 : row.numKickoffFirstTouch),
    }, {
      title: 'AFK',
      value: 'numKickoffAfk',
      template: (val) => val.toFixed(0),
      sortBy: (row) => (Number.isNaN(row.numKickoffAfk) ? 0 : row.numKickoffAfk),
    }, {
      title: 'Boost Used',
      value: 'boostUsage',
      template: (val) => val.toFixed(0),
      sortBy: (row) => (Number.isNaN(row.boostUsage) ? 0 : row.boostUsage),
    }, {
      title: 'Sm Boosts',
      value: 'numSmallBoosts',
      template: (val) => val.toFixed(0),
      sortBy: (row) => (Number.isNaN(row.numSmallBoosts) ? 0 : row.numSmallBoosts),
    }, {
      title: 'Lg Boosts',
      value: 'numLargeBoosts',
      template: (val) => val.toFixed(0),
      sortBy: (row) => (Number.isNaN(row.numLargeBoosts) ? 0 : row.numLargeBoosts),
    }, {
      title: 'Wasted Boost',
      value: 'wastedUsage',
      template: (val) => val.toFixed(0),
      sortBy: (row) => (Number.isNaN(row.wastedUsage) ? 0 : row.wastedUsage),
    }, {
      title: 'Stolen Boosts',
      value: 'numStolenBoosts',
      template: (val) => val.toFixed(0),
      sortBy: (row) => (Number.isNaN(row.numStolenBoosts) ? 0 : row.numStolenBoosts),
    }, {
      title: 'Hit Fwd Dist',
      value: 'ballHitForwardDist',
      template: (val) => val.toFixed(0),
      sortBy: (row) => (Number.isNaN(row.ballHitForwardDist) ? 0 : row.ballHitForwardDist),
    }, {
      title: 'Hit Back Dist',
      value: 'ballHitBackwardDist',
      template: (val) => val.toFixed(0),
      sortBy: (row) => (Number.isNaN(row.ballHitBackwardDist) ? 0 : row.ballHitBackwardDist),
    }, {
      title: 'Carries',
      value: 'totalCarries',
      template: (val) => val.toFixed(0),
      sortBy: (row) => (Number.isNaN(row.totalCarries) ? 0 : row.totalCarries),
    }, {
      title: 'Carry Dist',
      value: 'totalCarryDistance',
      template: (val) => val.toFixed(0),
      sortBy: (row) => (Number.isNaN(row.totalCarryDistance) ? 0 : row.totalCarryDistance),
    }, {
      title: 'Dribbles',
      value: 'totalDribbles',
      template: (val) => val.toFixed(0),
      sortBy: (row) => (Number.isNaN(row.totalDribbles) ? 0 : row.totalDribbles),
    }];
  } else if (statsView === 'avgAdvanced') {
    /* *********************** ADVANCED (AVERAGES) *********************** */
    calculations = [{
    //   title: 'Rating PG',
    //   value: 'scoreRatingVsTeamAvg',
    //   template: (val) => val.toFixed(1),
    //   sortBy: (row) => (Number.isNaN(row.scoreRatingVsTeamAvg) ? 0 : row.scoreRatingVsTeamAvg),
    // }, {
      title: 'Games',
      value: 'count',
      template: (val) => val.toFixed(0),
      sortBy: (row) => (Number.isNaN(row.count) ? 0 : row.count),
    }, {
      title: 'Useful Hits PG',
      value: 'usefulHitsAvg',
      template: (val) => val.toFixed(1),
      sortBy: (row) => (Number.isNaN(row.usefulHitsAvg) ? 0 : row.usefulHitsAvg),
    }, {
      title: 'Touches PG',
      value: 'ballTouchesAvg',
      template: (val) => val.toFixed(1),
      sortBy: (row) => (Number.isNaN(row.ballTouchesAvg) ? 0 : row.ballTouchesAvg),
    }, {
      title: 'Aerials PG',
      value: 'totalAerialsAvg',
      template: (val) => val.toFixed(1),
      sortBy: (row) => (Number.isNaN(row.totalAerialsAvg) ? 0 : row.totalAerialsAvg),
    }, {
      title: 'Turnovers PG',
      value: 'turnoversAvg',
      template: (val) => val.toFixed(1),
      sortBy: (row) => (Number.isNaN(row.turnoversAvg) ? 0 : row.turnoversAvg),
    }, {
      title: 'Takeaways PG',
      value: 'takeawaysAvg',
      template: (val) => val.toFixed(1),
      sortBy: (row) => (Number.isNaN(row.takeawaysAvg) ? 0 : row.takeawaysAvg),
    }, {
      title: 'First Touch PG',
      value: 'numKickoffFirstTouchAvg',
      template: (val) => val.toFixed(1),
      sortBy: (row) => (Number.isNaN(row.numKickoffFirstTouchAvg) ? 0 : row.numKickoffFirstTouchAvg),
    }, {
      title: 'AFK PG',
      value: 'numKickoffAfkAvg',
      template: (val) => val.toFixed(1),
      sortBy: (row) => (Number.isNaN(row.numKickoffAfkAvg) ? 0 : row.numKickoffAfkAvg),
    }, {
      title: 'Boost Used PG',
      value: 'boostUsageAvg',
      template: (val) => val.toFixed(1),
      sortBy: (row) => (Number.isNaN(row.boostUsageAvg) ? 0 : row.boostUsageAvg),
    }, {
      title: 'Sm Boosts PG',
      value: 'numSmallBoostsAvg',
      template: (val) => val.toFixed(1),
      sortBy: (row) => (Number.isNaN(row.numSmallBoostsAvg) ? 0 : row.numSmallBoostsAvg),
    }, {
      title: 'Lg Boosts PG',
      value: 'numLargeBoostsAvg',
      template: (val) => val.toFixed(1),
      sortBy: (row) => (Number.isNaN(row.numLargeBoostsAvg) ? 0 : row.numLargeBoostsAvg),
    }, {
      title: 'Wasted Boost PG',
      value: 'wastedUsageAvg',
      template: (val) => val.toFixed(1),
      sortBy: (row) => (Number.isNaN(row.wastedUsageAvg) ? 0 : row.wastedUsageAvg),
    }, {
      title: 'Avg Boost',
      value: 'averageBoostLevelAvg',
      template: (val) => val.toFixed(1),
      sortBy: (row) => (Number.isNaN(row.averageBoostLevelAvg) ? 0 : row.averageBoostLevelAvg),
    }, {
      title: 'Stolen Boosts PG',
      value: 'numStolenBoostsAvg',
      template: (val) => val.toFixed(1),
      sortBy: (row) => (Number.isNaN(row.numStolenBoostsAvg) ? 0 : row.numStolenBoostsAvg),
    }, {
      title: 'Avg Speed',
      value: 'averageSpeedAvg',
      template: (val) => val.toFixed(1),
      sortBy: (row) => (Number.isNaN(row.averageSpeedAvg) ? 0 : row.averageSpeedAvg),
    }, {
      title: 'Avg Hit Dist PG',
      value: 'averageHitDistanceAvg',
      template: (val) => val.toFixed(1),
      sortBy: (row) => (Number.isNaN(row.averageHitDistanceAvg) ? 0 : row.averageHitDistanceAvg),
    }, {
      title: 'Hit Fwd Dist PG',
      value: 'ballHitForwardDistAvg',
      template: (val) => val.toFixed(1),
      sortBy: (row) => (Number.isNaN(row.ballHitForwardDistAvg) ? 0 : row.ballHitForwardDistAvg),
    }, {
      title: 'Hit Back Dist PG',
      value: 'ballHitBackwardDistAvg',
      template: (val) => val.toFixed(1),
      sortBy: (row) => (Number.isNaN(row.ballHitBackwardDistAvg) ? 0 : row.ballHitBackwardDistAvg),
    }, {
      title: 'Carries PG',
      value: 'totalCarriesAvg',
      template: (val) => val.toFixed(1),
      sortBy: (row) => (Number.isNaN(row.totalCarriesAvg) ? 0 : row.totalCarriesAvg),
    }, {
      title: 'Carry Dist PG',
      value: 'totalCarryDistanceAvg',
      template: (val) => val.toFixed(1),
      sortBy: (row) => (Number.isNaN(row.totalCarryDistanceAvg) ? 0 : row.totalCarryDistanceAvg),
    }, {
      title: 'Dribbles PG',
      value: 'totalDribblesAvg',
      template: (val) => val.toFixed(1),
      sortBy: (row) => (Number.isNaN(row.totalDribblesAvg) ? 0 : row.totalDribblesAvg),
    }];
  } else if (statsView === 'timeStats') {
    calculations = [{
      title: 'Games',
      value: 'count',
      template: (val) => val.toFixed(0),
      sortBy: (row) => (Number.isNaN(row.count) ? 0 : row.count),
    }, {
      title: 'High Air Time',
      value: 'timeHighInAir',
      template: (val) => val.toFixed(0),
      sortBy: (row) => (Number.isNaN(row.timeHighInAir) ? 0 : row.timeHighInAir),
    }, {
      title: 'Low Air Time',
      value: 'timeLowInAir',
      template: (val) => val.toFixed(0),
      sortBy: (row) => (Number.isNaN(row.timeLowInAir) ? 0 : row.timeLowInAir),
    }, {
      title: 'Slow Time',
      value: 'timeAtSlowSpeed',
      template: (val) => val.toFixed(0),
      sortBy: (row) => (Number.isNaN(row.timeAtSlowSpeed) ? 0 : row.timeAtSlowSpeed),
    }, {
      title: 'Boost Time',
      value: 'timeAtBoostSpeed',
      template: (val) => val.toFixed(0),
      sortBy: (row) => (Number.isNaN(row.timeAtBoostSpeed) ? 0 : row.timeAtBoostSpeed),
    }, {
      title: 'SuperSonic Time',
      value: 'timeAtSuperSonic',
      template: (val) => val.toFixed(0),
      sortBy: (row) => (Number.isNaN(row.timeAtSuperSonic) ? 0 : row.timeAtSuperSonic),
    }, {
      title: 'Ballcam Time',
      value: 'timeBallcam',
      template: (val) => val.toFixed(0),
      sortBy: (row) => (Number.isNaN(row.timeBallcam) ? 0 : row.timeBallcam),
    }, {
      title: 'Wall Time',
      value: 'timeOnWall',
      template: (val) => val.toFixed(0),
      sortBy: (row) => (Number.isNaN(row.timeOnWall) ? 0 : row.timeOnWall),
    }, {
      title: 'Time Most Forward',
      value: 'timeMostForwardPlayer',
      template: (val) => val.toFixed(0),
      sortBy: (row) => (Number.isNaN(row.timeMostForwardPlayer) ? 0 : row.timeMostForwardPlayer),
    }, {
      title: 'Time Most Back',
      value: 'timeMostBackPlayer',
      template: (val) => val.toFixed(0),
      sortBy: (row) => (Number.isNaN(row.timeMostBackPlayer) ? 0 : row.timeMostBackPlayer),
    }, {
      title: 'Time Between',
      value: 'timeBetweenPlayers',
      template: (val) => val.toFixed(0),
      sortBy: (row) => (Number.isNaN(row.timeBetweenPlayers) ? 0 : row.timeBetweenPlayers),
    }, {
      title: 'Time Behind Ball',
      value: 'timeBehindBall',
      template: (val) => val.toFixed(0),
      sortBy: (row) => (Number.isNaN(row.timeBehindBall) ? 0 : row.timeBehindBall),
    }, {
      title: 'Time In Front Ball',
      value: 'timeInFrontBall',
      template: (val) => val.toFixed(0),
      sortBy: (row) => (Number.isNaN(row.timeInFrontBall) ? 0 : row.timeInFrontBall),
    }, {
      title: 'Time Near Ball',
      value: 'timeCloseToBall',
      template: (val) => val.toFixed(0),
      sortBy: (row) => (Number.isNaN(row.timeCloseToBall) ? 0 : row.timeCloseToBall),
    }, {
      title: 'Game Time',
      value: 'timeInGame',
      template: (val) => val.toFixed(0),
      sortBy: (row) => (Number.isNaN(row.timeInGame) ? 0 : row.timeInGame),
    }, {
      title: 'Time Def 3rd',
      value: 'timeInDefendingThird',
      template: (val) => val.toFixed(0),
      sortBy: (row) => (Number.isNaN(row.timeInDefendingThird) ? 0 : row.timeInDefendingThird),
    }, {
      title: 'Time Neutral 3rd',
      value: 'timeInNeutralThird',
      template: (val) => val.toFixed(0),
      sortBy: (row) => (Number.isNaN(row.timeInNeutralThird) ? 0 : row.timeInNeutralThird),
    }, {
      title: 'Time Atk 3rd',
      value: 'timeInAttackingThird',
      template: (val) => val.toFixed(0),
      sortBy: (row) => (Number.isNaN(row.timeInAttackingThird) ? 0 : row.timeInAttackingThird),
    }];
  } else if (statsView === 'timeStatsAvg') {
    calculations = [{
      title: 'Games',
      value: 'count',
      template: (val) => val.toFixed(0),
      sortBy: (row) => (Number.isNaN(row.count) ? 0 : row.count),
    }, {
      title: 'High Air Time PG',
      value: 'timeHighInAirAvg',
      template: (val) => val.toFixed(1),
      sortBy: (row) => (Number.isNaN(row.timeHighInAirAvg) ? 0 : row.timeHighInAirAvg),
    }, {
      title: 'Low Air Time PG',
      value: 'timeLowInAirAvg',
      template: (val) => val.toFixed(1),
      sortBy: (row) => (Number.isNaN(row.timeLowInAirAvg) ? 0 : row.timeLowInAirAvg),
    }, {
      title: 'Slow Time PG',
      value: 'timeAtSlowSpeedAvg',
      template: (val) => val.toFixed(1),
      sortBy: (row) => (Number.isNaN(row.timeAtSlowSpeedAvg) ? 0 : row.timeAtSlowSpeedAvg),
    }, {
      title: 'Boost Time PG',
      value: 'timeAtBoostSpeedAvg',
      template: (val) => val.toFixed(1),
      sortBy: (row) => (Number.isNaN(row.timeAtBoostSpeedAvg) ? 0 : row.timeAtBoostSpeedAvg),
    }, {
      title: 'SuperSonic Time PG',
      value: 'timeAtSuperSonicAvg',
      template: (val) => val.toFixed(1),
      sortBy: (row) => (Number.isNaN(row.timeAtSuperSonicAvg) ? 0 : row.timeAtSuperSonicAvg),
    }, {
      title: 'Ballcam Time PG',
      value: 'timeBallcamAvg',
      template: (val) => val.toFixed(1),
      sortBy: (row) => (Number.isNaN(row.timeBallcamAvg) ? 0 : row.timeBallcamAvg),
    }, {
      title: 'Wall Time PG',
      value: 'timeOnWallAvg',
      template: (val) => val.toFixed(1),
      sortBy: (row) => (Number.isNaN(row.timeOnWallAvg) ? 0 : row.timeOnWallAvg),
    }, {
      title: 'Time Most Forward PG',
      value: 'timeMostForwardPlayerAvg',
      template: (val) => val.toFixed(1),
      sortBy: (row) => (Number.isNaN(row.timeMostForwardPlayerAvg) ? 0 : row.timeMostForwardPlayerAvg),
    }, {
      title: 'Time Most Back PG',
      value: 'timeMostBackPlayerAvg',
      template: (val) => val.toFixed(1),
      sortBy: (row) => (Number.isNaN(row.timeMostBackPlayerAvg) ? 0 : row.timeMostBackPlayerAvg),
    }, {
      title: 'Time Between PG',
      value: 'timeBetweenPlayersAvg',
      template: (val) => val.toFixed(1),
      sortBy: (row) => (Number.isNaN(row.timeBetweenPlayersAvg) ? 0 : row.timeBetweenPlayersAvg),
    }, {
      title: 'Time Behind Ball PG',
      value: 'timeBehindBallAvg',
      template: (val) => val.toFixed(1),
      sortBy: (row) => (Number.isNaN(row.timeBehindBallAvg) ? 0 : row.timeBehindBallAvg),
    }, {
      title: 'Time In Front Ball PG',
      value: 'timeInFrontBallAvg',
      template: (val) => val.toFixed(1),
      sortBy: (row) => (Number.isNaN(row.timeInFrontBallAvg) ? 0 : row.timeInFrontBallAvg),
    }, {
      title: 'Time Near Ball PG',
      value: 'timeCloseToBallAvg',
      template: (val) => val.toFixed(1),
      sortBy: (row) => (Number.isNaN(row.timeCloseToBallAvg) ? 0 : row.timeCloseToBallAvg),
    }, {
      title: 'Avg Game Time',
      value: 'timeInGameAvg',
      template: (val) => val.toFixed(1),
      sortBy: (row) => (Number.isNaN(row.timeInGameAvg) ? 0 : row.timeInGameAvg),
    }, {
      title: 'Time Def 3rd PG',
      value: 'timeInDefendingThirdAvg',
      template: (val) => val.toFixed(1),
      sortBy: (row) => (Number.isNaN(row.timeInDefendingThirdAvg) ? 0 : row.timeInDefendingThirdAvg),
    }, {
      title: 'Time Neut 3rd PG',
      value: 'timeInNeutralThirdAvg',
      template: (val) => val.toFixed(1),
      sortBy: (row) => (Number.isNaN(row.timeInNeutralThirdAvg) ? 0 : row.timeInNeutralThirdAvg),
    }, {
      title: 'Time Atk 3rd PG',
      value: 'timeInAttackingThirdAvg',
      template: (val) => val.toFixed(1),
      sortBy: (row) => (Number.isNaN(row.timeInAttackingThirdAvg) ? 0 : row.timeInAttackingThirdAvg),
    }];
  }
  // const test = {
  //   id: '24-KAWA-4',
  //   gameId: '24',
  //   playerName: 'KAWA',
  //   season: 4,
  //   teamName: 'PILGRIMS',
  //   opposingTeam: 'DEATH',
  //   teamGoals: '3',
  //   opponentGoals: '2',
  //   playerScore: '784',
  //   playerGoals: '2',
  //   playerAssists: '0',
  //   playerSaves: '4',
  //   playerShots: '4',
  //   playerMVP: '1',
  //   playerPts: '2',
  //   statsType: 'RS',
  //   playerWin: '1',
  //   playerLoss: '0',
  //   teamTotScore: '1086',
  //   teamAvgScore: '362',
  //   playerPercentOfTeam: '0.722',
  //   playerRatingVsTeam: '2.166',
  //   oppTotScore: '773',
  //   teamsScoreRatio: '1.40',
  //   playerBallTouches: '39',
  //   playerTimeHighInAir: '8.378723405',
  //   playerTimeLowInAir: '95.78887697',
  //   playerTotalAerials: '5',
  //   playerNumDemosInflicted: '0',
  //   playerNumDemosTaken: '0',
  //   playerNumTimeFirstTouch: '2',
  //   playerNumTimeAfk: '0',
  //   playerTotalClears: '5',
  //   playerTotalPasses: '5',
  //   playerTurnovers: '7',
  //   playerTakeaways: '9',
  //   playerBoostUsage: '1402.981279',
  //   playerNumSmallBoosts: '37',
  //   playerNumLargeBoosts: '12',
  //   playerWastedUsage: '173.7304459',
  //   playerAverageBoostLevel: '57.27769944',
  //   playerNumStolenBoosts: '1',
  //   playerAverageSpeed: '13734.35087',
  //   playerAverageHitDistance: '2206.803431',
  //   playerTimeAtSlowSpeed: '42.0918569',
  //   playerTimeAtBoostSpeed: '158.5401624',
  //   playerTimeAtSuperSonic: '20.72620018',
  //   playerTimeBallcam: '296.1933834',
  //   playerTimeOnWall: '89.45294631',
  //   playerTimeMostForwardPlayer: '101.9907026',
  //   playerTimeMostBackPlayer: '151.4602135',
  //   playerTimeBetweenPlayers: '81.59805408',
  //   playerTimeBehindBall: '267.3567598',
  //   playerTimeInFrontBall: '67.69221039',
  //   playerBallHitForwardDist: '64690.34073',
  //   playerBallHitBackwardDist: '5768.830078',
  //   playerTimeCloseToBall: '27.44542667',
  //   playerTotalCarries: '0',
  //   playerTotalCarryDistance: '0',
  //   playerTotalDribbles: '11',
  //   teamTimeClumped: '61.15270206',
  //   playerUsefulHits: '20',
  //   playerTimeInGame: '335.0489702',
  //   playerTimeInDefendingThird: '175.580246',
  //   playerTimeInNeutralThird: '103.9997229',
  //   playerTimeInAttackingThird: '55.46900126',
  //   playerId: 1,
  //   player: 1,
  // };

  const handleStatsType = (newValue) => {
    if (newValue !== statsView) {
      setStatsView(newValue);
    }
  };

  playerStats.sort((a, b) => a.opposingTeam - b.opposingTeam);

  return (
    <Grid item xs={12} className={classes.playerCard}>
      <Paper className={classes.darkPaper}>
        <ToggleButtonGroup
          id="indiv-player-stats-toggle"
          onChange={(event, newValue) => handleStatsType(newValue)}
          value={statsView}
          exclusive
          style={{ float: 'right', margin: 8 }}
        >
          <ToggleButton key="option-total" value="total">
            Total
          </ToggleButton>
          <ToggleButton key="option-avg" value="avg">
            Avg
          </ToggleButton>
          <ToggleButton key="option-advanced" value="advanced">
            Advanced
          </ToggleButton>
          <ToggleButton key="option-avg-advanced" value="avgAdvanced">
            Avg Adv
          </ToggleButton>
          <ToggleButton key="option-times" value="timeStats">
            Times
          </ToggleButton>
          <ToggleButton key="option-avg-times" value="timeStatsAvg">
            Avg Times
          </ToggleButton>
        </ToggleButtonGroup>
        <ReactPivot
          rows={playerStats}
          dimensions={dimensions}
          reduce={reduce}
          calculations={calculations}
          nPaginateRows={200}
          compact
          csvDownloadFileName={`${playerName || player}Stats.csv`}
        />
        {loading && <CircularProgress color="secondary" />}
      </Paper>
      {/* <Grid container className={classes.statsHeader} spacing={1} alignItems="flex-start" justify="flex-start">
          <Grid item xs>Matchup</Grid>
          <Grid item xs>Result</Grid>
          <Grid item xs>Goals</Grid>
          <Grid item xs>Assists</Grid>
          <Grid item xs>Saves</Grid>
          <Grid item xs>Shots</Grid>
          <Grid item xs>Score</Grid>
          <Grid item xs>% of Team</Grid>
        </Grid>
        {playerStats.map((statRow) => (
          <Grid container spacing={1} alignItems="flex-start" justify="flex-start">
            <Grid item xs>{statRow.opposingTeam}</Grid>
            <Grid item xs>{`${parseInt(statRow.teamGoals, 10) > parseInt(statRow.opponentGoals, 10) ? 'W' : 'L'} [${statRow.teamGoals} - ${statRow.opponentGoals}]`}</Grid>
            <Grid item xs>{statRow.playerGoals}</Grid>
            <Grid item xs>{statRow.playerAssists}</Grid>
            <Grid item xs>{statRow.playerSaves}</Grid>
            <Grid item xs>{statRow.playerShots}</Grid>
            <Grid item xs>{statRow.playerScore}</Grid>
            <Grid item xs>{`${(statRow.playerPercentOfTeam * 100).toFixed(0)}%`}</Grid>
          </Grid>
        ))}
      </Paper> */}
    </Grid>
  );
}

PlayerGameStats.propTypes = {
  player: PropTypes.number.isRequired,
  season: PropTypes.number.isRequired,
  playerName: PropTypes.string,
};

PlayerGameStats.defaultProps = {
  playerName: '',
};

export default PlayerGameStats;
