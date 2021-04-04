import React from 'react';
import PropTypes from 'prop-types';
import {
  Typography, Avatar, Grid,
} from '@material-ui/core';
import { defaults, HorizontalBar } from 'react-chartjs-2';

import { makeStyles } from '@material-ui/core/styles';

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

const colorOptions = [
  'rgba(255, 99, 132, 0.3)',
  'rgba(54, 162, 235, 0.3)',
  'rgba(255, 206, 86, 0.3)',
  'rgba(75, 192, 192, 0.3)',
  'rgba(153, 102, 255, 0.2)',
  'rgba(255, 159, 64, 0.2)',
];
const borderOptions = [
  'rgba(255, 99, 132, 1)',
  'rgba(54, 162, 235, 1)',
  'rgba(255, 206, 86, 1)',
  'rgba(75, 192, 192, 1)',
  'rgba(153, 102, 255, 1)',
  'rgba(255, 159, 64, 1)',
];

/**
 * getOptions returns the options for HorizontalBar chart
 * @param {boolean} showLegend whether to show the legend
 * @param {number} xLimit x-axis max value
 */
const getOptions = (showLegend, xLimit) => ({
  scales: {
    xAxes: [{
      stacked: true,
      gridLines: {
        zeroLineWidth: 2,
        zeroLineColor: 'rgba(210, 210, 210, 1)',
        color: 'rgba(210, 210, 210, 0.1)',
        drawBorder: false,
      },
      ticks: {
        min: -xLimit,
        max: xLimit,
        callback: (value) => (value < 0 ? -parseInt(value, 10) : parseInt(value, 10)),
      },
      afterFit: (scaleInstance) => {
        // eslint-disable-next-line no-param-reassign
        scaleInstance.width = 100;
      },
    }],
    yAxes: [{
      stacked: true,
      gridLines: {
        display: false,
      },
      afterFit: (scaleInstance) => {
        // eslint-disable-next-line no-param-reassign
        scaleInstance.width = 50;
      },
    }],
  },
  legend: {
    display: showLegend,
    onClick: (e) => e.stopPropagation(),
  },
  tooltips: {
    callbacks: {
      label: (tooltipItem, data) => (
        `${data.datasets[tooltipItem.datasetIndex].label}: ${Math.abs(parseInt(tooltipItem.xLabel.toString(), 10))}`
      ),
    },
  },
  maintainAspectRatio: false,
});

// Change default font color for charts
defaults.global.defaultFontColor = 'rgba(210, 210, 210, 1)';

const barCharts = [{
  label: 'Scores',
  fieldName: 'playerScore',
}, {
  label: 'Goals',
  fieldName: 'playerGoals',
}, {
  label: 'Assists',
  fieldName: 'playerAssists',
}, {
  label: 'Saves',
  fieldName: 'playerSaves',
}, {
  label: 'Shots',
  fieldName: 'playerShots',
}];

const gameToLetterMap = {
  0: 'A',
  1: 'B',
  2: 'C',
  3: 'D',
  4: 'E',
};

/**
 * @param {object} props: game, homeTeamName, awayTeamName, curDivision
 * game should contain:
 * - playerStats array with each player's stats for the game
 * - avgBallSpeed
 * - neutralPossessionTime
 * - totalAerials
 * - gameLength
 * - probablyOT
 * - map
 * - serverRegion
 */
export default function GameStatsPlayersOverview(props) {
  const {
    game,
    homeTeamName,
    awayTeamName,
    curDivision,
  } = props;
  const classes = useStyles();

  const logoSrc = parseInt(curDivision, 10) === 2 ? div2 : div1;

  const statBars = [];

  let showLegend = true;
  barCharts.forEach((chartInfo) => {
    const chartData = {
      labels: [chartInfo.label],
      datasets: [],
    };

    // order the playerStats by home team, then away team
    if (homeTeamName.localeCompare(awayTeamName) < 0) { // home team alphabetically before away team
      game.playerStats.sort((a, b) => a.teamName.localeCompare(b.teamName));
    } else { // home team alphabetically after away team
      game.playerStats.sort((a, b) => b.teamName.localeCompare(a.teamName));
    }

    // console.log(game.playerStats);

    let sumPos = 0;
    let sumNeg = 0;
    game.playerStats.forEach((stat, i) => {
      const pValue = parseInt(stat[chartInfo.fieldName], 10);
      if (stat.teamName.toLowerCase() === homeTeamName.toLowerCase()) {
        sumNeg -= pValue;
      } else {
        sumPos += pValue;
      }
      chartData.datasets.push({
        label: stat.playerName,
        data: [stat.teamName.toLowerCase() === homeTeamName.toLowerCase() ? -pValue : pValue],
        stack: '1',
        backgroundColor: [colorOptions[i]],
        borderColor: [borderOptions[i]],
        borderWidth: 1,
      });
    });
    const xLimit = Math.round(Math.max(-sumNeg, sumPos) * 1.2) + 1;
    const options = getOptions(showLegend, xLimit);
    statBars.push(
      <Grid item xs={12}>
        <HorizontalBar
          data={chartData}
          options={options}
          height={showLegend ? 100 : 80}
          width={showLegend ? 302 : 300}
        />
      </Grid>,
    );
    showLegend = false;
  });

  return (
    <Grid item>
      <Grid container alignItems="center" justify="center" direction="row">
        {statBars}
      </Grid>
    </Grid>
  );
}

GameStatsPlayersOverview.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  game: PropTypes.object.isRequired,
  homeTeamName: PropTypes.string.isRequired,
  awayTeamName: PropTypes.string.isRequired,
  curDivision: PropTypes.number.isRequired,
};
