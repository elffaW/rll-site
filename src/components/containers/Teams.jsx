import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Grid, CircularProgress, Typography, Button,
} from '@material-ui/core';

import BaseApp from './BaseApp';
import TeamCard from '../TeamCard';
import PageHeader from '../PageHeader';
import api from '../utils/api';
import { styles as paperStyles } from '../../styles/themeStyles';

const defaultProps = {
  classes: '',
};

class Teams extends Component {
  constructor(props) {
    super(props);

    this.state = {
      teams: [], // teamsData.sort((a, b) => b.points - a.points), // sort with higher points at top
      loading: true,
    };
  }

  componentDidMount() {
    // update data?
    this.getData();
  }

  getData = () => {
    Promise.all([api.getAllPlayers(), api.getAllTeams()]).then((results) => {
      const allPlayers = results[0];
      const allTeams = results[1];
      const teams = allTeams.map((team) => team.data);
      teams.sort((a, b) => a.rank - b.rank); // sort with lower rank at top

      const players = allPlayers.map((player) => player.data);
      const teamsWithPlayers = teams.map((team) => {
        const { ...tempTeam } = team;
        const playerA = players.find((player) => parseInt(player.id, 10) === parseInt(tempTeam.members[0], 10));
        const playerB = players.find((player) => parseInt(player.id, 10) === parseInt(tempTeam.members[1], 10));
        const playerC = players.find((player) => parseInt(player.id, 10) === parseInt(tempTeam.members[2], 10));
        tempTeam.members = [playerA, playerB, playerC];
        return tempTeam;
      });
      this.setState({ teams: teamsWithPlayers, loading: false });
    });
  }

  render() {
    const { teams, loading } = this.state;
    return (
      <BaseApp>
        <PageHeader headerText="RLL Season 2 Teams" />
        { loading ? (
          <>
            <CircularProgress color="secondary" />
            <Typography>Loading Teams...</Typography>
            <Button onClick={this.getData}>Taking forever?</Button>
          </>
        ) : (
          <Grid container spacing={5} alignItems="flex-start" justify="flex-start">
            {teams.map((team) => (
              <TeamCard team={team} />
            ))}
          </Grid>
        )}
      </BaseApp>
    );
  }
}

Teams.propTypes = {
  classes: PropTypes.string,
};
Teams.defaultProps = defaultProps;

export default paperStyles(Teams);
