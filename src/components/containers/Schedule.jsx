import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Grid, Typography,
} from '@material-ui/core';

import BaseApp from './BaseApp';
import GameCard from '../GameCard';
import { styles as paperStyles } from '../../styles/themeStyles';

const defaultProps = {
  classes: '',
};

export const gamesData = [
  {
    id: 1, homeTeam: 1, awayTeam: 2, gameWeek: 1, gameTime: '05/29/2020 19:30 -0500', arena: 'Salty Shores',
  },
  {
    id: 2, homeTeam: 3, awayTeam: 4, gameWeek: 1, gameTime: '05/29/2020 19:50 -0500', arena: 'Salty Shores',
  },
  {
    id: 3, homeTeam: 5, awayTeam: 6, gameWeek: 1, gameTime: '05/29/2020 20:10 -0500', arena: 'Salty Shores',
  },
  {
    id: 4, homeTeam: 7, awayTeam: 8, gameWeek: 1, gameTime: '05/29/2020 20:30 -0500', arena: 'Salty Shores',
  },
  {
    id: 5, homeTeam: 1, awayTeam: 3, gameWeek: 1, gameTime: '05/29/2020 20:50 -0500', arena: 'Salty Shores',
  },
  {
    id: 6, homeTeam: 5, awayTeam: 2, gameWeek: 1, gameTime: '05/29/2020 21:10 -0500', arena: 'Salty Shores',
  },
  {
    id: 7, homeTeam: 7, awayTeam: 4, gameWeek: 1, gameTime: '05/29/2020 21:30 -0500', arena: 'Salty Shores',
  },
];

class Schedule extends Component {
  constructor(props) {
    super(props);

    // get all data for this page
    // this.setState({ games: gamesData });

    this.state = {
      games: gamesData,
    };
  }

  componentDidUpdate() {
    // update data?
  }

  render() {
    const { games } = this.state;
    return (
      <BaseApp>
        <Typography variant="h2">RLL Season 2 Schedule</Typography>
        <Grid container spacing={5} alignItems="flex-start" justify="flex-start">
          {games.map((game) => (
            <GameCard game={game} />
          ))}
        </Grid>
      </BaseApp>
    );
  }
}

Schedule.propTypes = {
  classes: PropTypes.string,
};
Schedule.defaultProps = defaultProps;

export default paperStyles(Schedule);
