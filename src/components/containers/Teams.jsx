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

export const teamsData = [
  {
    id: 1, name: 'Real Fake Bots', members: [0, 7, 16], wins: 0, losses: 0, points: 0, rank: 1,
  },
  {
    id: 2, name: 'Los Toros Hermanos', members: [5, 12, 20], wins: 0, losses: 0, points: 0, rank: 2,
  },
  {
    id: 3, name: 'Hold My Bear', members: [2, 9, 8], wins: 0, losses: 0, points: 0, rank: 3,
  },
  {
    id: 4, name: 'Boost Bandits', members: [3, 17, 18], wins: 0, losses: 0, points: 0, rank: 4,
  },
  {
    id: 5, name: 'Singley Meat Sandwich', members: [4, 11, 10], wins: 0, losses: 0, points: 0, rank: 5,
  },
  {
    id: 6, name: 'Hot Chickens', members: [1, 15, 14], wins: 0, losses: 0, points: 0, rank: 6,
  },
  {
    id: 7, name: 'Tri-Cs', members: [6, 13, 19], wins: 0, losses: 0, points: 0, rank: 7,
  },
  {
    id: 8, name: 'DinoBots', members: [21, 22, 23], wins: 0, losses: 0, points: 0, rank: 8,
  },
];

class Teams extends Component {
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

Teams.propTypes = {
  classes: PropTypes.string,
};
Teams.defaultProps = defaultProps;

export default paperStyles(Teams);
