import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  Grid, CircularProgress, Typography, Button, Paper, Avatar,
} from '@material-ui/core';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';

import api from './utils/api';
import { styles as paperStyles } from '../styles/themeStyles';

import { SEASONS } from './containers/BaseApp';

const teamFields = {
  rank: { friendly: 'Rank', type: 'number' },
  name: { friendly: 'Name', type: 'string' },
  wins: { friendly: 'W', type: 'number' },
  losses: { friendly: 'L', type: 'number' },
  points: { friendly: 'PTS', type: 'number' },
  value: { friendly: 'Value', type: 'value' }, // special case ($12.3 M)
  goalsFor: { friendly: 'GF', type: 'number' },
  goalsAgainst: { friendly: 'GA', type: 'number' },
  plusMinus: { friendly: '+/-', type: 'number' },
};

const defaultProps = {
  classes: '',
  season: SEASONS[SEASONS.length - 1], // default to the last season in the list
};

class Standings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      teams: [], // teamsData.sort((a, b) => b.points - a.points), // sort with higher points at top
      loading: true,
      sortField: 'rank',
      sortDirection: true, // just a toggle
    };
  }

  componentDidMount() {
    const { season } = this.props;
    // update data?
    this.getData(season);
  }

  componentDidUpdate(prevProps) {
    const { season } = this.props;
    if (season !== prevProps.season) {
      this.getData(season);
    }
  }

  getData = (season) => {
    api.getTeamsBySeason(season).then((allTeams) => {
      const teams = allTeams.map((team) => team.data);
      teams.sort((a, b) => a.rank - b.rank); // sort with lower (better) rank at top

      // disable these lint issues: import/no-dynamic-require global-require
      // eslint-disable-next-line
      teams.forEach((team) => team.logo = require(`../images/LOGO_${team.name.toUpperCase()}.png`));

      this.setState({
        teams, loading: false, sortField: 'rank', sortDirection: true,
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

  handleSortFieldChange = (sortBy) => {
    const { sortField, sortDirection } = this.state;
    if (sortField === sortBy) {
      this.handleSort(sortBy, !sortDirection);
    } else {
      this.handleSort(sortBy, sortDirection);
    }
  }

  handleSort = (sortBy, direction) => {
    const { teams } = this.state;
    let sortedTeams;
    if (teamFields[sortBy].type === 'string') {
      sortedTeams = this.sortTextData(teams, sortBy, direction);
    } else if (teamFields[sortBy].type === 'value') { // '$13.4 M' -- trim '$' and ' M' then sort numeric
      sortedTeams = teams.sort((a, b) => (
        direction
          ? parseFloat(b[sortBy].slice(1, -2)) - parseFloat(a[sortBy].slice(1, -2))
          : parseFloat(a[sortBy].slice(1, -2)) - parseFloat(b[sortBy].slice(1, -2))));
    } else {
      sortedTeams = this.sortNumberData(teams, sortBy, direction);
    }
    this.setState({ teams: sortedTeams, sortField: sortBy, sortDirection: direction });
  }

  render() {
    const { classes, season } = this.props;
    const {
      teams, loading, sortField, sortDirection,
    } = this.state;

    const teamRows = [];
    for (let i = 0; i < teams.length; i++) {
      const team = teams[i];
      teamRows.push(
        <Grid item xs={12} style={!(i % 2) ? { backgroundColor: 'rgba(130, 0, 0, 0.3)' } : {}}>
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
              <Typography className={classes.teamDesc} style={{ fontWeight: 700 }}>
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
        </Grid>,
      );
    }

    return (
      <>
        { loading ? (
          <>
            <CircularProgress color="secondary" />
            <Typography>Loading Standings...</Typography>
            <Button onClick={() => this.getData(season)}>Taking forever?</Button>
          </>
        ) : (
          <Grid container spacing={2} alignItems="flex-start" justify="flex-start">
            <Paper className={classes.paper}>
              <Grid item xs={12}>
                <Grid container alignItems="center" justify="flex-start">
                  <Grid item xs={1}>
                    <Typography variant="h6" onClick={() => this.handleSortFieldChange('rank')}>
                      Rank
                      {sortField === 'rank' && (<ArrowDropDownIcon style={sortDirection ? null : { transform: 'scaleY(-1)' }} />)}
                    </Typography>
                  </Grid>
                  <Grid item xs={1}>
                    {' '}
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="h6" style={{ float: 'left' }} onClick={() => this.handleSortFieldChange('name')}>
                      Team
                      {sortField === 'team' && (<ArrowDropDownIcon style={sortDirection ? null : { transform: 'scaleY(-1)' }} />)}
                    </Typography>
                  </Grid>
                  <Grid item xs={1}>
                    <Typography variant="h6" onClick={() => this.handleSortFieldChange('wins')}>
                      W
                      {sortField === 'wins' && (<ArrowDropDownIcon style={sortDirection ? null : { transform: 'scaleY(-1)' }} />)}
                    </Typography>
                  </Grid>
                  <Grid item xs={1}>
                    <Typography variant="h6" onClick={() => this.handleSortFieldChange('losses')}>
                      L
                      {sortField === 'losses' && (<ArrowDropDownIcon style={sortDirection ? null : { transform: 'scaleY(-1)' }} />)}
                    </Typography>
                  </Grid>
                  <Grid item xs={1}>
                    <Typography variant="h6" onClick={() => this.handleSortFieldChange('points')}>
                      PTS
                      {sortField === 'points' && (<ArrowDropDownIcon style={sortDirection ? null : { transform: 'scaleY(-1)' }} />)}
                    </Typography>
                  </Grid>
                  <Grid item xs={1}>
                    <Typography variant="h6" onClick={() => this.handleSortFieldChange('value')}>
                      Value
                      {sortField === 'value' && (<ArrowDropDownIcon style={sortDirection ? null : { transform: 'scaleY(-1)' }} />)}
                    </Typography>
                  </Grid>
                  <Grid item xs={1}>
                    <Typography variant="h6" onClick={() => this.handleSortFieldChange('goalsFor')}>
                      GF
                      {sortField === 'goalsFor' && (<ArrowDropDownIcon style={sortDirection ? null : { transform: 'scaleY(-1)' }} />)}
                    </Typography>
                  </Grid>
                  <Grid item xs={1}>
                    <Typography variant="h6" onClick={() => this.handleSortFieldChange('goalsAgainst')}>
                      GA
                      {sortField === 'goalsAgainst' && (<ArrowDropDownIcon style={sortDirection ? null : { transform: 'scaleY(-1)' }} />)}
                    </Typography>
                  </Grid>
                  <Grid item xs={1}>
                    <Typography variant="h6" onClick={() => this.handleSortFieldChange('plusMinus')}>
                      +/-
                      {sortField === 'plusMinus' && (<ArrowDropDownIcon style={sortDirection ? null : { transform: 'scaleY(-1)' }} />)}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              {teamRows}
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
  season: PropTypes.number,
};
Standings.defaultProps = defaultProps;

export default paperStyles(Standings);
