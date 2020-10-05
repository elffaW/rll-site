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
      sortDirection: true, // just a toggle
      season: SEASONS[SEASONS.length - 1], // default to the last season in the list
      avgTotal: true, // just a toggle (total === true)
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
        const playerTeam = teams.find((team) => parseInt(team.id, 10) === parseInt(tempPlayer.team, 10) && team.season === tempPlayer.season);
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
    const { avgTotal } = this.state;

    if (avgTotal !== newValue) {
      this.setState({ avgTotal: newValue });
    }
  }

  render() {
    const {
      players, seasonPlayers, loading, sortField, sortDirection, season, avgTotal,
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
      /* eslint-enable no-param-reassign */
      return memo;
    };
    const calculations = avgTotal ? [{
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
    }] : [{
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
            <Grid item xs={12} lg={10} xl={8}>
              {curPlayer ? '' : (
                <Paper className={classes.paper}>
                  <ToggleButtonGroup
                    id="average-total-toggle"
                    onChange={(event, newValue) => this.handleAvgTotal(newValue)}
                    value={avgTotal}
                    exclusive
                    size="large"
                    style={{ float: 'right', margin: 8 }}
                  >
                    <ToggleButton key="option-total" value>
                      Total
                    </ToggleButton>
                    <ToggleButton key="option-avg" value={false}>
                      Avg
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
                  {curPlayer ? curPlayer.map((player) => (
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
                          <span className={`player-season-${player.season}-inside`} />
                        </Typography>
                      </Grid>
                      <Grid item xs={11}>
                        <Grid container spacing={2} justify="center">
                          <PlayerCard player={player} inTeam={false} showDetails />
                        </Grid>
                      </Grid>
                    </>
                  )) : (
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
                                <span className={`player-season-${player.season}-inside`} />
                              </Typography>
                            </Tooltip>
                          </Grid>
                          <Grid item xs={11}>
                            <Grid container spacing={2} justify="center">
                              <PlayerCard player={player} inTeam={false} />
                            </Grid>
                          </Grid>
                        </>
                      ) : (
                        <PlayerCard player={player} inTeam={false} />
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
