import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Grid, Paper, CircularProgress,
} from '@material-ui/core';
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
  6: 3,
};

/**
 *
 * @param {*} props
 *
 * @example GOAL OBJECT
 * ```json
 * {
 *    "playerName": "kawa",
 *    "playerId": "1713652328878319061",
 *    "teamName": "KFC",
 *    "oppTeamName": "TACO BELL",
 *    "frameNumber": 455,
 *    "timeOfGoal": 14,
 *    "timeOfGame": "2021-03-19T23:42:26.000Z",
 *    "teamScoreBeforeGoal": 0,
 *    "oppScoreBeforeGoal": 0,
 *    "distanceToGoal": 1917.919216,
 *    "assisted": false,
 *    "aerial": true,
 *    "isProbablyOTGoal": false,
 *    "season": 6,
 *    "gameWeek": 1,
 *    "gameNum": 2,
 *    "gameId": "2021-03-19.19.42 Player Private Loss 2021-03-19-19-42",
 *    "id": "6-2-455"
 * }
 * ```
 */
function PlayerGoalStats(props) {
  const { playerName, season } = props;
  const classes = useStyles();
  const [goalStats, setGoalStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAllGoals().then((allGoals) => {
      const goalsTemp = allGoals.map((goal) => goal.data);
      const goals = goalsTemp.map((goal) => {
        const { ...temp } = goal;
        temp.teamSize = seasonToTeamSizeMap[goal.season] || 3;
        return temp;
      });
      // console.log(goals);
      // console.log(goals.length, 'STATS GAMES RETRIEVED');
      setGoalStats(goals);
      setLoading(false);
    }).catch((e) => {
      console.error('error with goals API request');
      console.error(e);
      setLoading(false);
    });
  }, [playerName, season]);

  const convertSecToTime = (val) => {
    const hr = Math.floor(val / 3600);
    const min = Math.floor(val / 60);
    const sec = `0${(val % 60).toFixed(0)}`.slice(-2);
    if (hr > 0) {
      return `${hr}:${`0${min}`.slice(-2)}:${sec}`;
    }
    return `${min}:${sec}`;
  };

  const dimensions = [
    { value: 'id', title: 'Indiv Goal' },
    { value: (row) => (`${row.teamName}v${row.oppTeamName}-${row.gameNum}`), title: 'Game' },
    { value: 'playerName', title: 'Player' },
    { value: 'teamName', title: 'Team' },
    { value: 'oppTeamName', title: 'Opponent' },
    { value: 'season', title: 'Season' },
    { value: 'teamSize', title: 'Team Size' },
    { value: (row) => (row.gameWeek ? row.gameWeek : '?'), title: 'Gameweek' },
    { value: 'teamScoreBeforeGoal', title: 'Team Score Before Goal' },
    { value: 'oppScoreBeforeGoal', title: 'Opp Score Before Goal' },
    { value: (row) => (parseInt(row.teamScoreBeforeGoal, 10) - parseInt(row.oppScoreBeforeGoal, 10)), title: 'Score Diff Before Goal' },
    { value: 'isProbablyOTGoal', title: 'OT Goal' },
  ];
  const reduce = (row, memo) => {
    /* eslint-disable no-param-reassign */
    memo.count = (memo.count || 0) + 1;
    memo.distanceToGoalTotal = (memo.distanceToGoalTotal || 0)
      + ((!row.distanceToGoal || row.distanceToGoal < 0) ? 0 : parseFloat(row.distanceToGoal));
    memo.distanceToGoalAvg = (memo.distanceToGoalTotal || 0) / (memo.count || 1);
    memo.aerialsTotal = (memo.aerialsTotal || 0) + +(row.aerial || false);
    memo.aerialsAvg = (memo.aerialsTotal || 0) / (memo.count || 1);
    memo.assistedsTotal = (memo.assistedsTotal || 0) + +(row.assisted || false);
    memo.assistedsAvg = (memo.assistedsTotal || 0) / (memo.count || 1);
    memo.OTGoalsTotal = (memo.OTGoalsTotal || 0) + +(row.isProbablyOTGoal || false);
    memo.OTGoalsAvg = (memo.OTGoalsTotal || 0) / (memo.count || 1);
    memo.timeOfGoalTotal = (memo.timeOfGoalTotal || 0) + +(row.timeOfGoal || false);
    memo.timeOfGoalAvg = (memo.timeOfGoalTotal || 0) / (memo.count || 1);
    /* eslint-enable no-param-reassign */
    return memo;
  };
  /* *********************** TOTAL (DEFAULT) *********************** */
  const calculations = [{
    title: 'Goals',
    value: 'count',
    template: (val) => val.toFixed(0),
    sortBy: (row) => (Number.isNaN(row.count) ? 0 : row.count),
  }, {
    title: 'Dist to Goal (m)',
    value: 'distanceToGoalTotal',
    template: (val) => ((val || 0) / 100).toFixed(1),
    sortBy: (row) => (Number.isNaN(row.distanceToGoalTotal) ? 0 : row.distanceToGoalTotal),
  }, {
    title: 'Avg Dist to Goal (m)',
    value: 'distanceToGoalAvg',
    template: (val) => ((val || 0) / 100).toFixed(1),
    sortBy: (row) => (Number.isNaN(row.distanceToGoalAvg) ? 0 : row.distanceToGoalAvg),
  }, {
    title: 'Aerial Goals',
    value: 'aerialsTotal',
    template: (val) => val.toFixed(0),
    sortBy: (row) => (Number.isNaN(row.aerialsTotal) ? 0 : row.aerialsTotal),
  }, {
    title: '% Aerials',
    value: 'aerialsAvg',
    template: (val) => (val * 100).toFixed(1),
    sortBy: (row) => (Number.isNaN(row.aerialsAvg) ? 0 : row.aerialsAvg),
  }, {
    title: 'Assisted Goals',
    value: 'assistedsTotal',
    template: (val) => val.toFixed(0),
    sortBy: (row) => (Number.isNaN(row.assistedsTotal) ? 0 : row.assistedsTotal),
  }, {
    title: '% Assisted',
    value: 'assistedsAvg',
    template: (val) => (val * 100).toFixed(1),
    sortBy: (row) => (Number.isNaN(row.assistedsAvg) ? 0 : row.assistedsAvg),
  }, {
    title: 'OT Goals',
    value: 'OTGoalsTotal',
    template: (val) => val.toFixed(0),
    sortBy: (row) => (Number.isNaN(row.OTGoalsTotal) ? 0 : row.OTGoalsTotal),
  }, {
    title: '% OT',
    value: 'OTGoalsAvg',
    template: (val) => (val * 100).toFixed(1),
    sortBy: (row) => (Number.isNaN(row.OTGoalsAvg) ? 0 : row.OTGoalsAvg),
  }, {
    title: 'Time of Goal',
    value: 'timeOfGoalTotal',
    template: (val) => convertSecToTime(val),
    sortBy: (row) => (Number.isNaN(row.timeOfGoalTotal) ? 0 : row.timeOfGoalTotal),
  }, {
    title: 'Avg Time of Goal',
    value: 'timeOfGoalAvg',
    template: (val) => convertSecToTime(val),
    sortBy: (row) => (Number.isNaN(row.timeOfGoalAvg) ? 0 : row.timeOfGoalAvg),
  }];

  goalStats.sort((a, b) => a.opposingTeam - b.opposingTeam);

  return (
    <Grid item xs={12} className={classes.playerCard}>
      <Paper className={classes.darkPaper}>
        <ReactPivot
          rows={goalStats}
          dimensions={dimensions}
          reduce={reduce}
          calculations={calculations}
          nPaginateRows={200}
          compact
          csvDownloadFileName={`${playerName}GoalStats.csv`}
        />
        {loading && <CircularProgress color="secondary" />}
      </Paper>
    </Grid>
  );
}

PlayerGoalStats.propTypes = {
  season: PropTypes.number.isRequired,
  playerName: PropTypes.string,
};

PlayerGoalStats.defaultProps = {
  playerName: '',
};

export default PlayerGoalStats;
