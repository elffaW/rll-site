import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Grid,
  Paper,
  CircularProgress,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
} from '@material-ui/core';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import ToggleButton from '@material-ui/lab/ToggleButton';
import SortIcon from '@material-ui/icons/Sort';
import ReactPivot from 'react-pivot';

import BaseApp, { SEASONS } from './BaseApp';
import PageHeader from '../PageHeader';
import PlayerCard from '../PlayerCard';
import PlayerGameStats from '../PlayerGameStats';

import SeasonSelector from '../SeasonSelector';

import api from '../utils/api';

import { styles as paperStyles } from '../../styles/themeStyles';

// import rllSvg from '../../images/RLL_logo_plain.svg';

// eslint-disable-next-line import/no-unresolved
// const Config = require('Config');

const playerFields = {
  name: {
    friendly: 'Name',
    type: 'string',
  },
  rlName: {
    friendly: 'Rocket League Name',
    type: 'string',
  },
  team: {
    friendly: 'Team',
    type: 'team', // special case
  },
  car: {
    friendly: 'Car',
    type: 'string',
  },
  signingValue: {
    friendly: 'Signing Value',
    type: 'strnum', // float as string
  },
  primaryRole: {
    friendly: 'Primary Role',
    type: 'string',
  },
  secondaryRole: {
    friendly: 'Secondary Role',
    type: 'string',
  },
  score: {
    friendly: 'Score',
    type: 'number',
  },
  goals: {
    friendly: 'Goals',
    type: 'number',
  },
  assists: {
    friendly: 'Assists',
    type: 'number',
  },
  saves: {
    friendly: 'Saves',
    type: 'number',
  },
  shots: {
    friendly: 'Shots',
    type: 'number',
  },
  numMVP: {
    friendly: '# MVPs',
    type: 'number',
  },
  points: {
    friendly: 'Points',
    type: 'number',
  },
  gamesPlayed: {
    friendly: 'Games Played',
    type: 'number',
  },
  value: {
    friendly: 'Current Value',
    type: 'strnum', // float as string
  },
  system: {
    friendly: 'System',
    type: 'string',
  },
  country: {
    friendly: 'Country',
    type: 'string',
  },
  position: {
    friendly: 'Position',
    type: 'string',
  },
  season: {
    friendly: 'Season',
    type: 'number',
  },
};

class Players extends Component {
  constructor(props) {
    super(props);

    this.state = {
      players: [],
      seasonPlayers: [],
      loading: true,
      sortField: 'value',
      statField: 'value',
      sortDirection: true, // just a toggle
      season: SEASONS[SEASONS.length - 1], // default to the last season in the list
      statsView: 'total', // view for pivot table: total, avg, advanced, avgAdvanced
    };
  }

  componentDidMount() {
    // get all data for this page

    // get the players
    this.getData();
  }

  getData = (newSeason) => {
    const { season } = this.state;
    const seasonQuery = newSeason || season;

    Promise.all([api.getAllPlayers(), api.getAllTeams()]).then((results) => {
    // Promise.all([api.getPlayersBySeason(seasonQuery), api.getTeamsBySeason(seasonQuery)]).then((results) => {
      const allPlayers = results[0];
      const allTeams = results[1];
      const players = allPlayers.map((player) => player.data);
      players.sort((a, b) => b.value - a.value); // sort with higher value at top

      const teams = allTeams.map((player) => player.data);
      const playersWithTeams = players.map((player) => {
        const { ...tempPlayer } = player;
        const playerTeam = teams.find((team) => (
          parseInt(team.id, 10) === parseInt(tempPlayer.team, 10) && team.season === tempPlayer.season));
        if (playerTeam) {
          tempPlayer.team = playerTeam;
          tempPlayer.teamName = playerTeam.name;
        }

        tempPlayer.wins = parseInt(playerTeam.wins || 0, 10);
        tempPlayer.losses = parseInt(playerTeam.losses || 0, 10);
        tempPlayer.plusMinus = parseInt(playerTeam.plusMinus || 0, 10);

        return tempPlayer;
      });

      const seasonPlayers = (seasonQuery === 'All') ? playersWithTeams : playersWithTeams.filter((player) => player.season === seasonQuery);
      this.setState({
        players: playersWithTeams, loading: false, season: seasonQuery, seasonPlayers,
      });
    });
  }

  sortNumberData = (data, sortField, direction) => data.sort((a, b) => (
    direction
      ? parseFloat(b[sortField]) - parseFloat(a[sortField])
      : parseFloat(a[sortField]) - parseFloat(b[sortField])));

  sortTextData = (data, sortField, direction) => data.sort((a, b) => (
    direction
      ? a[sortField].localeCompare(b[sortField])
      : b[sortField].localeCompare(a[sortField])));

  handleSortFieldChange = (event) => {
    const { sortDirection } = this.state;
    const sortBy = event.target.value;
    this.handleSort(sortBy, sortDirection);
  }

  handleSort = (sortBy, direction) => {
    const { players, season } = this.state;
    let sortedPlayers;
    if (playerFields[sortBy].type === 'string') {
      sortedPlayers = this.sortTextData(players, sortBy, direction);
    } else if (playerFields[sortBy].type === 'team') {
      sortedPlayers = players.sort((a, b) => (
        direction
          ? a.team.name.localeCompare(b.team.name)
          : b.team.name.localeCompare(a.team.name)));
    } else {
      sortedPlayers = this.sortNumberData(players, sortBy, direction);
    }

    const seasonPlayers = (season === 'All') ? players : players.filter((player) => player.season === season);
    this.setState({
      players: sortedPlayers, sortField: sortBy, sortDirection: direction, seasonPlayers,
    });
  }

  handleStatFieldChange = (event) => {
    this.setState({ statField: event.target.value });
  }

  handleSeasonChange = (event) => {
    const { season, players } = this.state;
    const newSeason = event.target.value === 'All' ? 'All' : parseInt(event.target.value, 10);
    if (season !== newSeason) {
      if (newSeason === 'All') {
        this.setState({ season: newSeason, seasonPlayers: players });
      } else {
        const seasonPlayers = players.filter((player) => player.season === newSeason);
        this.setState({ season: newSeason, seasonPlayers });
      }
    }
  }

  refreshData = () => {
    this.getData();
  }

  handleAvgTotal = (newValue) => {
    const { statsView } = this.state;

    if (statsView !== newValue) {
      this.setState({ statsView: newValue });
    }
  }

  render() {
    const {
      players, seasonPlayers, loading, sortField, statField, sortDirection, season, statsView,
    } = this.state;
    const { classes, match } = this.props;
    const { params } = match;
    const { playerName } = params;

    const dimensions = [
      { value: 'teamName', title: 'Team' },
      { value: 'name', title: 'Name' },
      { value: 'car', title: 'Car' },
      { value: 'primaryRole', title: 'Primary Role' },
      { value: 'secondaryRole', title: 'Secondary Role' },
      { value: 'system', title: 'System' },
      { value: 'country', title: 'Country' },
      { value: 'position', title: 'Position' },
      { value: 'season', title: 'Season' },
      // score
      // goals
      // assists
      // saves
      // shots
      // numMVP
      // points
      // gamesPlayed
      // value
    ];
    const reduce = (row, memo) => {
      /* eslint-disable no-param-reassign */
      memo.count = (memo.count || 0) + 1;
      memo.gamesPlayedTotal = (memo.gamesPlayedTotal || 0) + parseFloat(row.gamesPlayed);
      memo.gamesPlayedAvg = (memo.gamesPlayedTotal || 0) / (memo.count || 1);
      memo.winsTotal = (memo.winsTotal || 0) + parseFloat(row.wins);
      memo.winsAvg = (memo.winsTotal || 0) / (memo.count || 1);
      memo.lossesTotal = (memo.lossesTotal || 0) + parseFloat(row.losses);
      memo.lossesAvg = (memo.lossesTotal || 0) / (memo.count || 1);
      memo.plusMinusTotal = (memo.plusMinusTotal || 0) + parseFloat(row.plusMinus);
      memo.plusMinusAvg = (memo.plusMinusTotal || 0) / (memo.gamesPlayedTotal || 1);
      memo.goalsTotal = (memo.goalsTotal || 0) + parseFloat(row.goals);
      memo.goalsAvg = (memo.goalsTotal || 0) / (memo.gamesPlayedTotal || 1);
      memo.assistsTotal = (memo.assistsTotal || 0) + parseFloat(row.assists);
      memo.assistsAvg = (memo.assistsTotal || 0) / (memo.gamesPlayedTotal || 1);
      memo.pointsTotal = (memo.pointsTotal || 0) + parseFloat(row.goals) + parseFloat(row.assists); // derived stat
      memo.pointsAvg = (memo.pointsTotal || 0) / (memo.gamesPlayedTotal || 1);
      memo.savesTotal = (memo.savesTotal || 0) + parseFloat(row.saves);
      memo.savesAvg = (memo.savesTotal || 0) / (memo.gamesPlayedTotal || 1);
      memo.shotsTotal = (memo.shotsTotal || 0) + parseFloat(row.shots);
      memo.shotsAvg = (memo.shotsTotal || 0) / (memo.gamesPlayedTotal || 1);
      memo.numMVPTotal = (memo.numMVPTotal || 0) + parseFloat(row.numMVP);
      memo.numMVPAvg = (memo.numMVPTotal || 0) / (memo.count || 1);
      memo.scoreTotal = (memo.scoreTotal || 0) + parseFloat(row.score);
      memo.scoreAvg = (memo.scoreTotal || 0) / (memo.gamesPlayedTotal || 1);
      memo.valueTotal = (memo.valueTotal || 0) + parseFloat(row.value);
      memo.valueAvg = (memo.valueTotal || 0) / (memo.count || 1);
      // from advanced but added to regular
      memo.numDemosInflicted = (memo.numDemosInflicted || 0) + parseInt(row.numDemosInflicted, 10);
      memo.numDemosTaken = (memo.numDemosTaken || 0) + parseInt(row.numDemosTaken, 10);
      memo.totalClears = (memo.totalClears || 0) + parseInt(row.totalClears, 10);
      memo.totalPasses = (memo.totalPasses || 0) + parseInt(row.totalPasses, 10);
      memo.numDemosInflictedAvg = (memo.numDemosInflicted || 0) / (memo.gamesPlayedTotal || 1);
      memo.numDemosTakenAvg = (memo.numDemosTaken || 0) / (memo.gamesPlayedTotal || 1);
      memo.totalClearsAvg = (memo.totalClears || 0) / (memo.gamesPlayedTotal || 1);
      memo.totalPassesAvg = (memo.totalPasses || 0) / (memo.gamesPlayedTotal || 1);
      // advanced stats
      // memo.scorePercentOfTeam = (memo.scorePercentOfTeam || 0) + parseFloat(row.scorePercentOfTeam);
      // memo.scoreRatingVsTeam = (memo.scoreRatingVsTeam || 0) + parseFloat(row.scoreRatingVsTeam);
      memo.ballTouches = (memo.ballTouches || 0) + parseInt(row.ballTouches, 10);
      memo.timeHighInAir = (memo.timeHighInAir || 0) + parseFloat(row.timeHighInAir);
      memo.timeLowInAir = (memo.timeLowInAir || 0) + parseFloat(row.timeLowInAir);
      memo.totalAerials = (memo.totalAerials || 0) + parseInt(row.totalAerials, 10);
      memo.turnovers = (memo.turnovers || 0) + parseInt(row.turnovers, 10);
      memo.takeaways = (memo.takeaways || 0) + parseInt(row.takeaways, 10);
      memo.numKickoffFirstTouch = (memo.numKickoffFirstTouch || 0) + parseInt(row.numKickoffFirstTouch, 10);
      memo.numKickoffAfk = (memo.numKickoffAfk || 0) + parseInt(row.numKickoffAfk, 10);
      memo.boostUsage = (memo.boostUsage || 0) + parseFloat(row.boostUsage);
      memo.numSmallBoosts = (memo.numSmallBoosts || 0) + parseInt(row.numSmallBoosts, 10);
      memo.numLargeBoosts = (memo.numLargeBoosts || 0) + parseInt(row.numLargeBoosts, 10);
      memo.wastedUsage = (memo.wastedUsage || 0) + parseFloat(row.wastedUsage);
      memo.averageBoostLevel = (memo.averageBoostLevel || 0) + parseFloat(row.averageBoostLevel);
      memo.numStolenBoosts = (memo.numStolenBoosts || 0) + parseInt(row.numStolenBoosts, 10);
      memo.averageSpeed = (memo.averageSpeed || 0) + parseFloat(row.averageSpeed);
      memo.averageHitDistance = (memo.averageHitDistance || 0) + parseFloat(row.averageHitDistance);
      memo.timeAtSlowSpeed = (memo.timeAtSlowSpeed || 0) + parseFloat(row.timeAtSlowSpeed);
      memo.timeAtBoostSpeed = (memo.timeAtBoostSpeed || 0) + parseFloat(row.timeAtBoostSpeed);
      memo.timeAtSuperSonic = (memo.timeAtSuperSonic || 0) + parseFloat(row.timeAtSuperSonic);
      memo.timeBallcam = (memo.timeBallcam || 0) + parseFloat(row.timeBallcam);
      memo.timeOnWall = (memo.timeOnWall || 0) + parseFloat(row.timeOnWall);
      memo.timeMostForwardPlayer = (memo.timeMostForwardPlayer || 0) + parseFloat(row.timeMostForwardPlayer);
      memo.timeMostBackPlayer = (memo.timeMostBackPlayer || 0) + parseFloat(row.timeMostBackPlayer);
      memo.timeBetweenPlayers = (memo.timeBetweenPlayers || 0) + parseFloat(row.timeBetweenPlayers);
      memo.timeBehindBall = (memo.timeBehindBall || 0) + parseFloat(row.timeBehindBall);
      memo.timeInFrontBall = (memo.timeInFrontBall || 0) + parseFloat(row.timeInFrontBall);
      memo.ballHitForwardDist = (memo.ballHitForwardDist || 0) + parseFloat(row.ballHitForwardDist);
      memo.ballHitBackwardDist = (memo.ballHitBackwardDist || 0) + parseFloat(row.ballHitBackwardDist);
      memo.timeCloseToBall = (memo.timeCloseToBall || 0) + parseFloat(row.timeCloseToBall);
      memo.totalCarries = (memo.totalCarries || 0) + parseInt(row.totalCarries, 10);
      memo.totalCarryDistance = (memo.totalCarryDistance || 0) + parseFloat(row.totalCarryDistance);
      memo.totalDribbles = (memo.totalDribbles || 0) + parseInt(row.totalDribbles, 10);
      memo.usefulHits = (memo.usefulHits || 0) + parseInt(row.usefulHits, 10);
      memo.timeInGame = (memo.timeInGame || 0) + parseFloat(row.timeInGame);
      memo.timeInDefendingThird = (memo.timeInDefendingThird || 0) + parseFloat(row.timeInDefendingThird);
      memo.timeInNeutralThird = (memo.timeInNeutralThird || 0) + parseFloat(row.timeInNeutralThird);
      memo.timeInAttackingThird = (memo.timeInAttackingThird || 0) + parseFloat(row.timeInAttackingThird);
      // advanced AVERAGE stats
      // memo.scorePercentOfTeamAvg = (memo.scorePercentOfTeam || 0) / (memo.gamesPlayedTotal || 1);
      // memo.scoreRatingVsTeamAvg = (memo.scoreRatingVsTeam || 0) / (memo.gamesPlayedTotal || 1);
      memo.ballTouchesAvg = (memo.ballTouches || 0) / (memo.gamesPlayedTotal || 1);
      memo.timeHighInAirAvg = (memo.timeHighInAir || 0) / (memo.gamesPlayedTotal || 1);
      memo.timeLowInAirAvg = (memo.timeLowInAir || 0) / (memo.gamesPlayedTotal || 1);
      memo.totalAerialsAvg = (memo.totalAerials || 0) / (memo.gamesPlayedTotal || 1);
      memo.turnoversAvg = (memo.turnovers || 0) / (memo.gamesPlayedTotal || 1);
      memo.takeawaysAvg = (memo.takeaways || 0) / (memo.gamesPlayedTotal || 1);
      memo.numKickoffFirstTouchAvg = (memo.numKickoffFirstTouch || 0) / (memo.gamesPlayedTotal || 1);
      memo.numKickoffAfkAvg = (memo.numKickoffAfk || 0) / (memo.gamesPlayedTotal || 1);
      memo.boostUsageAvg = (memo.boostUsage || 0) / (memo.gamesPlayedTotal || 1);
      memo.numSmallBoostsAvg = (memo.numSmallBoosts || 0) / (memo.gamesPlayedTotal || 1);
      memo.numLargeBoostsAvg = (memo.numLargeBoosts || 0) / (memo.gamesPlayedTotal || 1);
      memo.wastedUsageAvg = (memo.wastedUsage || 0) / (memo.gamesPlayedTotal || 1);
      memo.averageBoostLevelAvg = (memo.averageBoostLevel || 0) / (memo.gamesPlayedTotal || 1);
      memo.numStolenBoostsAvg = (memo.numStolenBoosts || 0) / (memo.gamesPlayedTotal || 1);
      memo.averageSpeedAvg = (memo.averageSpeed || 0) / (memo.gamesPlayedTotal || 1);
      memo.averageHitDistanceAvg = (memo.averageHitDistance || 0) / (memo.gamesPlayedTotal || 1);
      memo.timeAtSlowSpeedAvg = (memo.timeAtSlowSpeed || 0) / (memo.gamesPlayedTotal || 1);
      memo.timeAtBoostSpeedAvg = (memo.timeAtBoostSpeed || 0) / (memo.gamesPlayedTotal || 1);
      memo.timeAtSuperSonicAvg = (memo.timeAtSuperSonic || 0) / (memo.gamesPlayedTotal || 1);
      memo.timeBallcamAvg = (memo.timeBallcam || 0) / (memo.gamesPlayedTotal || 1);
      memo.timeOnWallAvg = (memo.timeOnWall || 0) / (memo.gamesPlayedTotal || 1);
      memo.timeMostForwardPlayerAvg = (memo.timeMostForwardPlayer || 0) / (memo.gamesPlayedTotal || 1);
      memo.timeMostBackPlayerAvg = (memo.timeMostBackPlayer || 0) / (memo.gamesPlayedTotal || 1);
      memo.timeBetweenPlayersAvg = (memo.timeBetweenPlayers || 0) / (memo.gamesPlayedTotal || 1);
      memo.timeBehindBallAvg = (memo.timeBehindBall || 0) / (memo.gamesPlayedTotal || 1);
      memo.timeInFrontBallAvg = (memo.timeInFrontBall || 0) / (memo.gamesPlayedTotal || 1);
      memo.ballHitForwardDistAvg = (memo.ballHitForwardDist || 0) / (memo.gamesPlayedTotal || 1);
      memo.ballHitBackwardDistAvg = (memo.ballHitBackwardDist || 0) / (memo.gamesPlayedTotal || 1);
      memo.timeCloseToBallAvg = (memo.timeCloseToBall || 0) / (memo.gamesPlayedTotal || 1);
      memo.totalCarriesAvg = (memo.totalCarries || 0) / (memo.gamesPlayedTotal || 1);
      memo.totalCarryDistanceAvg = (memo.totalCarryDistance || 0) / (memo.gamesPlayedTotal || 1);
      memo.totalDribblesAvg = (memo.totalDribbles || 0) / (memo.gamesPlayedTotal || 1);
      memo.usefulHitsAvg = (memo.usefulHits || 0) / (memo.gamesPlayedTotal || 1);
      memo.timeInGameAvg = (memo.timeInGame || 0) / (memo.gamesPlayedTotal || 1);
      memo.timeInDefendingThirdAvg = (memo.timeInDefendingThird || 0) / (memo.gamesPlayedTotal || 1);
      memo.timeInNeutralThirdAvg = (memo.timeInNeutralThird || 0) / (memo.gamesPlayedTotal || 1);
      memo.timeInAttackingThirdAvg = (memo.timeInAttackingThird || 0) / (memo.gamesPlayedTotal || 1);
      /* eslint-enable no-param-reassign */
      return memo;
    };
    /* *********************** TOTAL (DEFAULT) *********************** */
    let calculations = [{
      title: 'Count',
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
      title: 'Total Games Played',
      value: 'gamesPlayedTotal',
      template: (val) => val.toFixed(0),
      sortBy: (row) => (Number.isNaN(row.gamesPlayedTotal) ? 0 : row.gamesPlayedTotal),
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
    }, {
      title: 'Total Value',
      value: 'valueTotal',
      template: (val) => `$${val.toFixed(1)}M`,
      sortBy: (row) => (Number.isNaN(row.valueTotal) ? 0 : row.valueTotal),
    }];
    /* *********************** AVERAGE *********************** */
    if (statsView === 'avg') {
      calculations = [{
        title: 'Count',
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
        title: 'Avg Games Played',
        value: 'gamesPlayedAvg',
        template: (val) => val.toFixed(1),
        sortBy: (row) => (Number.isNaN(row.gamesPlayedAvg) ? 0 : row.gamesPlayedAvg),
      }, {
        title: 'Avg Wins',
        value: 'winsAvg',
        template: (val) => val.toFixed(0),
        sortBy: (row) => (Number.isNaN(row.winsAvg) ? 0 : row.winsAvg),
      }, {
        title: 'Avg Losses',
        value: 'lossesAvg',
        template: (val) => val.toFixed(0),
        sortBy: (row) => (Number.isNaN(row.lossesAvg) ? 0 : row.lossesAvg),
      }, {
        title: 'Avg +/- PG',
        value: 'plusMinusAvg',
        template: (val) => val.toFixed(1),
        sortBy: (row) => (Number.isNaN(row.plusMinusAvg) ? 0 : row.plusMinusAvg),
      }, {
        title: 'Avg Value',
        value: 'valueAvg',
        template: (val) => `$${val.toFixed(1)}M`,
        sortBy: (row) => (Number.isNaN(row.valueAvg) ? 0 : row.valueAvg),
      }];
    } else if (statsView === 'advanced') {
      /* *********************** ADVANCED (TOTALS) *********************** */
      calculations = [{
        title: 'Count',
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
      }, {
        title: 'Games Played',
        value: 'gamesPlayedTotal',
        template: (val) => val.toFixed(0),
        sortBy: (row) => (Number.isNaN(row.gamesPlayedTotal) ? 0 : row.gamesPlayedTotal),
      }];
    } else if (statsView === 'avgAdvanced') {
      /* *********************** ADVANCED (AVERAGES) *********************** */
      calculations = [{
      //   title: '% of Team PG',
      //   value: 'scorePercentOfTeamAvg',
      //   template: (val) => (val * 100).toFixed(1),
      //   sortBy: (row) => (Number.isNaN(row.scorePercentOfTeamAvg) ? 0 : row.scorePercentOfTeamAvg),
      // }, {
      //   title: 'Rating PG',
      //   value: 'scoreRatingVsTeamAvg',
      //   template: (val) => val.toFixed(1),
      //   sortBy: (row) => (Number.isNaN(row.scoreRatingVsTeamAvg) ? 0 : row.scoreRatingVsTeamAvg),
      // }, {
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
      }, {
        title: 'Avg Games Played',
        value: 'gamesPlayedAvg',
        template: (val) => val.toFixed(0),
        sortBy: (row) => (Number.isNaN(row.gamesPlayedAvg) ? 0 : row.gamesPlayedAvg),
      }];
    } else if (statsView === 'timeStats') {
      calculations = [{
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
      }, {
        title: 'Avg Games Played',
        value: 'gamesPlayedAvg',
        template: (val) => val.toFixed(0),
        sortBy: (row) => (Number.isNaN(row.gamesPlayedAvg) ? 0 : row.gamesPlayedAvg),
      }];
    }

    let curPlayer;
    if (playerName) {
      curPlayer = players.filter((player) => player.name.toLowerCase() === playerName.toLowerCase());

      curPlayer.overallWins = 0;
      curPlayer.overallLosses = 0;
      curPlayer.overallPlusMinus = 0;
      for (let i = 0; i < curPlayer.length; i++) {
        const { team } = curPlayer[i];

        curPlayer.overallWins += parseInt(team.wins || 0, 10);
        curPlayer.overallLosses += parseInt(team.losses || 0, 10);
        curPlayer.overallPlusMinus += parseInt(team.plusMinus || 0, 10);
      }

      curPlayer.sort((p1, p2) => p1.season - p2.season);
    }

    let maxStat = 0;
    if (playerFields[statField].type === 'number' || playerFields[statField].type === 'strnum') {
      maxStat = Math.max(...seasonPlayers.map((p) => parseFloat(p[statField])), 0);
    }

    return (
      <BaseApp>
        <PageHeader headerText="RLL Players" />
        {curPlayer ? '' : (
          <>
            <br />
            <SeasonSelector
              season={season}
              showAllOption
              handleSeasonChange={this.handleSeasonChange}
              forceRefresh={this.refreshData}
            />
          </>
        )}
        {loading ? (
          <>
            <CircularProgress color="secondary" />
            <Typography>Loading Players...</Typography>
            <Button onClick={() => this.getData(season)}>Taking forever?</Button>
          </>
        ) : (
          <Grid container justify="center">
            <Grid item xs={12} lg={10}>
              {curPlayer ? '' : (
                <Paper className={classes.paper}>
                  <ToggleButtonGroup
                    id="average-total-toggle"
                    onChange={(event, newValue) => this.handleAvgTotal(newValue)}
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
                    rows={seasonPlayers}
                    dimensions={dimensions}
                    reduce={reduce}
                    calculations={calculations}
                    nPaginateRows={200}
                    compact
                    csvDownloadFileName="playerStats.csv"
                  />
                </Paper>
              )}
              <Paper className={classes.paper}>
                {curPlayer ? '' : (
                  <>
                    <ToggleButtonGroup
                      id="sort-direction-toggle"
                      onChange={(event, newValue) => this.handleSort(sortField, newValue)}
                      value={sortDirection}
                      exclusive
                      size="large"
                      style={{ float: 'right', margin: 8 }}
                    >
                      <ToggleButton key="option-desc" value>
                        <SortIcon />
                      </ToggleButton>
                      <ToggleButton key="option-asc" value={false}>
                        <SortIcon style={{ transform: 'scaleY(-1)' }} />
                      </ToggleButton>
                    </ToggleButtonGroup>
                    <FormControl variant="outlined" style={{ float: 'right', margin: 8 }}>
                      <InputLabel id="sort-select-outlined-label">Sort By</InputLabel>
                      <Select
                        labelId="sort-select-outlined-label"
                        id="sort-select-outlined"
                        value={sortField}
                        onChange={this.handleSortFieldChange}
                        label="Sort By"
                      >
                        {Object.keys(playerFields).map((key) => (
                          <MenuItem value={key}>{playerFields[key].friendly}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl variant="outlined" style={{ float: 'right', margin: 8 }}>
                      <InputLabel id="stat-select-outlined-label">Graph Field</InputLabel>
                      <Select
                        labelId="stat-select-outlined-label"
                        id="stat-select-outlined"
                        value={statField}
                        onChange={this.handleStatFieldChange}
                        label="Graph Field"
                      >
                        {Object.keys(playerFields).map((key) => { // eslint-disable-line consistent-return
                          if (playerFields[key].type === 'number' || playerFields[key].type === 'strnum') {
                            return <MenuItem value={key}>{playerFields[key].friendly}</MenuItem>;
                          }
                        })}
                      </Select>
                    </FormControl>
                  </>
                )}
                <Grid container spacing={1} alignItems="center" justify="center">
                  {!!curPlayer && (
                    <Grid container spacing={1} alignItems="center" justify="space-around">
                      <Grid item xs={4}>
                        <Typography variant="h5" style={{ fontVariant: 'small-caps' }}>Overall Record</Typography>
                      </Grid>
                      <Grid item xs={2}>
                        <Typography variant="h4" style={{ color: 'whitesmoke' }}>{`${curPlayer.overallWins} - ${curPlayer.overallLosses}`}</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="h5" style={{ fontVariant: 'small-caps' }}>Overall +/-</Typography>
                      </Grid>
                      <Grid item xs={2}>
                        <Typography variant="h4" style={{ color: '#383838' }}>{curPlayer.overallPlusMinus}</Typography>
                      </Grid>
                    </Grid>
                  )}
                  {curPlayer ? (
                    <>
                      {curPlayer.map((player) => (
                        <>
                          <Grid item xs={1}>
                            <Typography
                              variant="h4"
                              // style={{
                              //   color: 'white',
                              //   backgroundImage: `url(${rllSvg})`,
                              //   backgroundSize: '100%',
                              //   backgroundPosition: 'center',
                              //   backgroundRepeat: 'no-repeat',
                              //   padding: 24,
                              //   marginLeft: 16,
                              //   paddingLeft: 12,
                              // }}
                              className={`player-season-${player.season}`}
                            >
                              <span className={`player-season-${player.season}-inside`}>
                                {player.season}
                              </span>
                            </Typography>
                          </Grid>
                          <Grid item xs={11}>
                            <Grid container spacing={2} justify="center">
                              <PlayerCard player={player} inTeam={false} showDetails />
                            </Grid>
                          </Grid>
                        </>
                      ))}
                      <PlayerGameStats player={curPlayer[0].id} playerName={curPlayer[0].name} season={season} />
                    </>
                  ) : (
                    seasonPlayers.map((player) => (
                      season === 'All' ? (
                        <>
                          <Grid item xs={1}>
                            <Tooltip title={`Season ${player.season}`}>
                              <Typography
                                variant="h4"
                                className={`player-season-${player.season}`}
                                onClick={() => this.handleSeasonChange({ target: { value: player.season } })}
                              >
                                <span className={`player-season-${player.season}-inside`}>
                                  {player.season}
                                </span>
                              </Typography>
                            </Tooltip>
                          </Grid>
                          <Grid item xs={11}>
                            <Grid container spacing={2} justify="center">
                              <PlayerCard
                                player={player}
                                inTeam={false}
                                statValue={maxStat ? (parseFloat(player[statField]) / maxStat) * 100 : 100}
                              />
                            </Grid>
                          </Grid>
                        </>
                      ) : (
                        <PlayerCard
                          player={player}
                          inTeam={false}
                          statValue={maxStat ? (parseFloat(player[statField]) / maxStat) * 100 : 100}
                        />
                      )
                    ))
                  )}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        )}
      </BaseApp>
    );
  }
}

Players.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  match: PropTypes.object.isRequired,
  classes: PropTypes.string,
};
Players.defaultProps = {
  classes: '',
};

export default paperStyles(Players);
