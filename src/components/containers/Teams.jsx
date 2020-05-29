import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Grid, Typography,
} from '@material-ui/core';

import BaseApp from './BaseApp';
import TeamCard from '../TeamCard';
import { styles as paperStyles } from '../../styles/themeStyles';

const defaultProps = {
  classes: '',
};

const teamsData = [
  {
    name: 'Real Fake Bots', members: [0, 7, 16], wins: 0, losses: 0, points: 0, rank: 1,
  },
  {
    name: 'Hot Chickens', members: [1, 15, 14], wins: 0, losses: 0, points: 0, rank: 2,
  },
  {
    name: 'c', members: [2, 9, 8], wins: 0, losses: 0, points: 0, rank: 3,
  },
  {
    name: 'd', members: [3, 17, 18], wins: 0, losses: 0, points: 0, rank: 4,
  },
  {
    name: 'e', members: [4, 11, 10], wins: 0, losses: 0, points: 0, rank: 5,
  },
  {
    name: 'Los Toros Hermanos', members: [5, 12, 20], wins: 0, losses: 0, points: 0, rank: 6,
  },
  {
    name: 'g', members: [6, 13, 19], wins: 0, losses: 0, points: 0, rank: 7,
  },
  {
    name: 'DinoBots', members: [21, 22, 23], wins: 0, losses: 0, points: 0, rank: 8,
  },
];

class Stats extends Component {
  constructor(props) {
    super(props);

    // get all data for this page
    // this.setState({ teams: teamsData });

    this.state = {
      teams: teamsData.sort((a, b) => b.points - a.points), // sort with higher points at top
    };
  }

  componentDidUpdate() {
    // update data?
  }

  render() {
    const { classes } = this.props;
    const { teams } = this.state;
    return (
      <BaseApp>
        <Typography variant="h2">RLL Season 2 Teams</Typography>
        <Grid container spacing={5} alignItems="flex-start" justify="flex-start">
          {teams.map((team) => (
            <TeamCard team={team} />
          ))}
        </Grid>
      </BaseApp>
    );
  }
}

Stats.propTypes = {
  classes: PropTypes.string,
};
Stats.defaultProps = defaultProps;

export default paperStyles(Stats);
