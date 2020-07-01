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
} from '@material-ui/core';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import ToggleButton from '@material-ui/lab/ToggleButton';
import SortIcon from '@material-ui/icons/Sort';
import ReactPivot from 'react-pivot';

import BaseApp from './BaseApp';
import PageHeader from '../PageHeader';
import PlayerCard from '../PlayerCard';

import api from '../utils/api';

import { styles as paperStyles } from '../../styles/themeStyles';

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
};

class Players extends Component {
  constructor(props) {
    super(props);

    this.state = {
      players: [],
      loading: true,
      sortField: 'value',
      sortDirection: true, // just a toggle
    };
  }

  componentDidMount() {
    // get all data for this page

    // get the players
    this.getData();
  }

  getData = () => {
    Promise.all([api.getAllPlayers(), api.getAllTeams()]).then((results) => {
      const allPlayers = results[0];
      const allTeams = results[1];
      const players = allPlayers.map((player) => player.data);
      players.sort((a, b) => b.value - a.value); // sort with higher value at top

      const teams = allTeams.map((player) => player.data);
      const playersWithTeams = players.map((player) => {
        const { ...tempPlayer } = player;
        const playerTeam = teams.find((team) => parseInt(team.id, 10) === parseInt(tempPlayer.team, 10));
        if (playerTeam) {
          tempPlayer.team = playerTeam;
          tempPlayer.teamName = playerTeam.name;
        }
        return tempPlayer;
      });
      this.setState({ players: playersWithTeams, loading: false });
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
    const { players } = this.state;
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
    this.setState({ players: sortedPlayers, sortField: sortBy, sortDirection: direction });
  };

  render() {
    const {
      players, loading, sortField, sortDirection,
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
      memo.goalsTotal = (memo.goalsTotal || 0) + parseFloat(row.goals);
      memo.assistsTotal = (memo.assistsTotal || 0) + parseFloat(row.assists);
      memo.savesTotal = (memo.savesTotal || 0) + parseFloat(row.saves);
      memo.shotsTotal = (memo.shotsTotal || 0) + parseFloat(row.shots);
      memo.numMVPTotal = (memo.numMVPTotal || 0) + parseFloat(row.numMVP);
      memo.pointsTotal = (memo.pointsTotal || 0) + parseFloat(row.points);
      memo.gamesPlayedTotal = (memo.gamesPlayedTotal || 0) + parseFloat(row.gamesPlayed);
      memo.valueTotal = (memo.valueTotal || 0) + parseFloat(row.value);
      memo.count = (memo.count || 0) + 1;
      /* eslint-enable no-param-reassign */
      return memo;
    };
    const calculations = [{
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
      title: 'Total Points',
      value: 'pointsTotal',
      template: (val) => val.toFixed(0),
      sortBy: (row) => (Number.isNaN(row.pointsTotal) ? 0 : row.pointsTotal),
    }, {
      title: 'Total Games Played',
      value: 'gamesPlayedTotal',
      template: (val) => val.toFixed(0),
      sortBy: (row) => (Number.isNaN(row.gamesPlayedTotal) ? 0 : row.gamesPlayedTotal),
    }, {
      title: 'Total Value',
      value: 'valueTotal',
      template: (val) => `$${val.toFixed(2)}M`,
      sortBy: (row) => (Number.isNaN(row.valueTotal) ? 0 : row.valueTotal),
    }];

    let curPlayer;
    if (playerName) {
      curPlayer = players.find((player) => player.name.toLowerCase() === playerName.toLowerCase());
    }
    return (
      <BaseApp>
        <PageHeader headerText="RLL Season 2 Players" />
        {loading ? (
          <>
            <CircularProgress color="secondary" />
            <Typography>Loading Players...</Typography>
            <Button onClick={this.getData}>Taking forever?</Button>
          </>
        ) : (
          <Grid container justify="center">
            <Grid item xs={12} lg={10} xl={8}>
              <Paper className={classes.paper}>
                <ReactPivot
                  rows={players}
                  dimensions={dimensions}
                  reduce={reduce}
                  calculations={calculations}
                  nPaginateRows={200}
                  compact
                  csvDownloadFileName="playerStats.csv"
                />
              </Paper>
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
                <Grid container spacing={2} justify="center">
                  {curPlayer ? (
                    <PlayerCard player={curPlayer} inTeam={false} showDetails />
                  ) : (
                    players.map((player) => (
                      <PlayerCard player={player} inTeam={false} />
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
