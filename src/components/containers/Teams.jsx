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
  { name: 'Real Fake Bots', members: ['DanBot', 'Primiano', 'Andy'] },
  { name: 'Hot Chickens', members: ['Kawa', 'Myrv', 'ClunElissa'] },
  { name: 'c', members: ['Speder', 'Mike', 'Tom'] },
  { name: 'd', members: ['Matt Aux', 'Billy', 'Mitch'] },
  { name: 'e', members: ['PDT', 'Singley', 'Shanley'] },
  { name: 'Los Toros Hermanos', members: ['Sanchez', 'Jay', 'Matt H'] },
  { name: 'g', members: ['TC', 'JR', 'Cohn'] },
  { name: 'DinoBots', members: ['Marley', 'Dan', 'C-Block'] },
];

class Stats extends Component {
  constructor(props) {
    super(props);

    // get all data for this page
    // this.setState({ teams: teamsData });

    this.state = {
      teams: teamsData,
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
