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
