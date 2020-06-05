import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Grid, Paper, CircularProgress, Typography, Button,
} from '@material-ui/core';

import BaseApp from './BaseApp';
import PageHeader from '../PageHeader';
import PlayerCard from '../PlayerCard';

import api from '../utils/api';

import { styles as paperStyles } from '../../styles/themeStyles';

// eslint-disable-next-line import/no-unresolved
// const Config = require('Config');

class Players extends Component {
  constructor(props) {
    super(props);

    this.state = {
      players: [],
      loading: true,
    };
  }

  componentDidMount() {
    // get all data for this page

    // get the players
    this.getData();
  }

  getData = () => {
    api.getAllPlayers().then((allPlayers) => {
      const players = allPlayers.map((player) => player.data);
      players.sort((a, b) => b.value - a.value); // sort with higher value at top

      this.setState({ players, loading: false });
    });
  }

  render() {
    const { players, loading } = this.state;
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
            <Grid container spacing={2} justify="center">
              {curPlayer ? (
                <PlayerCard player={curPlayer} inTeam={false} />
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
