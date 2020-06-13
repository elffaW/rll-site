import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  Grid, CircularProgress, Typography, Button, Paper, Avatar,
} from '@material-ui/core';

import BaseApp from './BaseApp';
import PageHeader from '../PageHeader';
import api from '../utils/api';
import { styles as paperStyles } from '../../styles/themeStyles';

const defaultProps = {
  classes: '',
};

class Standings extends Component {
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
    api.getAllTeams().then((allTeams) => {
      const teams = allTeams.map((team) => team.data);
      teams.sort((a, b) => a.rank - b.rank); // sort with lower rank at top

      // disable these lint issues: import/no-dynamic-require global-require
      // eslint-disable-next-line
      teams.forEach((team) => team.logo = require(`../../images/LOGO_${team.name}.png`));

      this.setState({ teams, loading: false });
    });
  }

  render() {
    const { classes } = this.props;
    const { teams, loading } = this.state;

    return (
      <>
        {/* <PageHeader headerText="RLL Season 2 Standings" /> */}
        { loading ? (
          <>
            <CircularProgress color="secondary" />
            <Typography>Loading Standings...</Typography>
            <Button onClick={this.getData}>Taking forever?</Button>
          </>
        ) : (
          <Grid container spacing={2} alignItems="flex-start" justify="flex-start">
            <Paper className={classes.paper}>
              <Grid item xs={12}>
                <Grid container alignItems="center" justify="flex-start">
                  <Grid item xs={1}>
                    <Typography variant="h6">Rank</Typography>
                  </Grid>
                  <Grid item xs={1}>
                    {' '}
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="h6" style={{ float: 'left' }}>Team</Typography>
                  </Grid>
                  <Grid item xs={1}>
                    <Typography variant="h6">W</Typography>
                  </Grid>
                  <Grid item xs={1}>
                    <Typography variant="h6">L</Typography>
                  </Grid>
                  <Grid item xs={1}>
                    <Typography variant="h6">PTS</Typography>
                  </Grid>
                  <Grid item xs={1}>
                    <Typography variant="h6">Value</Typography>
                  </Grid>
                  <Grid item xs={1}>
                    <Typography variant="h6">GF</Typography>
                  </Grid>
                  <Grid item xs={1}>
                    <Typography variant="h6">GA</Typography>
                  </Grid>
                  <Grid item xs={1}>
                    <Typography variant="h6">+/-</Typography>
                  </Grid>
                </Grid>
              </Grid>
              {teams.map((team) => (
                <Grid item xs={12} style={team.rank % 2 === 1 ? { backgroundColor: 'rgba(130, 0, 0, 0.3)' } : {}}>
                  <Grid container alignItems="center" justify="flex-start">
                    <Grid item xs={1}>
                      <Typography variant="h4">
                        {team.rank}
                      </Typography>
                    </Grid>
                    <Grid item xs={1}>
                      <Avatar src={team.logo} variant="square" style={{ float: 'right', paddingRight: 8 }} />
                    </Grid>
                    <Grid item xs={3}>
                      <Link to={`/teams/${team.name}`} exact>
                        <Typography variant="h5" className={classes.teamName} style={{ float: 'left' }}>
                          {team.name}
                        </Typography>
                      </Link>
                    </Grid>
                    <Grid item xs={1}>
                      <Typography variant="body1" className={classes.teamRecord}>
                        {team.wins}
                      </Typography>
                    </Grid>
                    <Grid item xs={1}>
                      <Typography variant="body1" className={classes.teamRecord}>
                        {team.losses}
                      </Typography>
                    </Grid>
                    <Grid item xs={1}>
                      <Typography className={classes.teamDesc}>
                        {team.points}
                      </Typography>
                    </Grid>
                    <Grid item xs={1}>
                      <Typography className={classes.teamDesc}>
                        {team.value}
                      </Typography>
                    </Grid>
                    <Grid item xs={1}>
                      <Typography className={classes.teamDetails}>{team.goalsFor}</Typography>
                    </Grid>
                    <Grid item xs={1}>
                      <Typography className={classes.teamDetails}>{team.goalsAgainst}</Typography>
                    </Grid>
                    <Grid item xs={1}>
                      <Typography className={classes.teamDetails}>{team.plusMinus}</Typography>
                    </Grid>
                  </Grid>
                </Grid>
              ))}
            </Paper>
          </Grid>
        )}
      </>
    );
  }
}

Standings.propTypes = {
  // eslint-disable-next-line react/no-unused-prop-types
  classes: PropTypes.string,
};
Standings.defaultProps = defaultProps;

export default paperStyles(Standings);
