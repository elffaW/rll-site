import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  Grid, CircularProgress, Typography, Button, Paper,
} from '@material-ui/core';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { withTheme } from '@material-ui/core/styles';

import api from './utils/api';
import { styles as paperStyles } from '../styles/themeStyles';

import { SEASONS } from './containers/BaseApp';

const playerFields = {
  name: { friendly: 'NAME', type: 'string' },
  points: { friendly: 'PTS', type: 'number' },
  value: { friendly: 'VALUE', type: 'number' },
  goals: { friendly: 'G', type: 'number' },
  assists: { friendly: 'A', type: 'number' },
  saves: { friendly: 'SV', type: 'number' },
  shots: { friendly: 'SH', type: 'number' },
  numDemosInflicted: { friendly: 'DEMOS', type: 'number' },
  totalClears: { friendly: 'CLEARS', type: 'number' },
  numKickoffFirstTouch: { friendly: '1ST TOUCH', type: 'number' },
  totalAerials: { friendly: 'AIR HITS', type: 'number' },
  totalDribbles: { friendly: 'DRIBBLES', type: 'number' },
  numKickoffAfk: { friendly: 'AFKs', type: 'number' },
  // numPromoted: { friendly: 'PROMOTED', type: 'number' },
  // numRelegated: { friendly: 'RELEGATED', type: 'number' },
};

const fieldValues = {
  goals: 5,
  assists: 4,
  saves: 3,
  shots: 1,
  numDemosInflicted: 3,
  totalClears: 1,
  numKickoffFirstTouch: 2,
  totalAerials: 1,
  totalDribbles: 0.5,
  numKickoffAfk: -10,
  // numPromoted: 20,
  // numRelegated: -20,
};

const defaultProps = {
  classes: '',
  season: SEASONS[SEASONS.length - 1], // default to the last season in the list
};

class FantasyPlayers extends Component {
  constructor(props) {
    super(props);

    this.state = {
      players: [],
      loading: true,
      sortField: 'points',
      sortDirection: false, // just a toggle
      statsDisplay: false, // just a toggle
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
    api.getPlayersBySeason(season).then((allPlayers) => {
      const playersData = allPlayers.map((player) => player.data);

      const players = playersData.map((p) => {
        const { ...player } = p;
        player.points = Object.keys(fieldValues).map((field) => (
          (parseFloat(player[field]) * fieldValues[field]) || 0
        )).reduce((accum, cur) => accum + cur);
        return player;
      });
      players.sort((a, b) => parseFloat(b.points) - parseFloat(a.points)); // sort with higher (better) points at top

      this.setState({
        players, loading: false,
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
    const { players } = this.state;
    let sorted;
    if (playerFields[sortBy].type === 'string') {
      sorted = this.sortTextData(players, sortBy, direction);
    } else if (playerFields[sortBy].type === 'value') { // '$13.4 M' -- trim '$' and ' M' then sort numeric
      sorted = players.sort((a, b) => (
        direction
          ? parseFloat(b[sortBy].slice(1, -2)) - parseFloat(a[sortBy].slice(1, -2))
          : parseFloat(a[sortBy].slice(1, -2)) - parseFloat(b[sortBy].slice(1, -2))));
    } else {
      sorted = this.sortNumberData(players, sortBy, direction);
    }
    this.setState({ players: sorted, sortField: sortBy, sortDirection: direction });
  }

  render() {
    const { classes, season, theme } = this.props;
    const {
      players, loading, sortField, sortDirection, statsDisplay,
    } = this.state;

    /**
     *  points
        value
        goals
        assists
        saves
        shots
        numDemosInflicted
        numKickoffFirstTouch
        totalClears
        numKickoffAfk
        totalDribbles
     */
    const playerRows = [];
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      playerRows.push(
        <Grid item xs={12} style={!(i % 2) ? { backgroundColor: theme.palette.secondary.light } : {}}>
          <Grid container alignItems="center" justify="center">
            <Grid item xs={1}>
              <Link to={`/players/${player.name}`} exact>
                <Typography variant="h5" className={classes.playerName} style={{ float: 'left' }}>
                  {player.name}
                </Typography>
              </Link>
            </Grid>
            <Grid item xs={1}>
              <Typography className={classes.playerDetails}>{player.points.toFixed(0)}</Typography>
            </Grid>
            <Grid item xs={1}>
              <Typography className={classes.playerDetails}>{`$${parseFloat(player.value).toFixed(1)}M`}</Typography>
            </Grid>
            {Object.keys(fieldValues).map((field) => (
              <Grid item xs={1}>
                <Typography className={classes.playerDetails}>
                  {statsDisplay ? parseFloat(player[field]).toFixed(0) : (parseFloat(player[field]) * fieldValues[field]).toFixed(0)}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Grid>,
      );
    }

    return (
      <>
        { loading ? (
          <>
            <CircularProgress color="secondary" />
            <Typography>Loading Fantasy...</Typography>
            <Button onClick={() => this.getData(season)}>Taking forever?</Button>
          </>
        ) : (
          <Grid container spacing={2} alignItems="flex-start" justify="flex-start">
            <Paper className={classes.paper}>
              <Typography variant="h4" style={{ float: 'left', margin: '8px 0 0 8px', textShadow: '1px 1px 1px lightgray' }}>
                Player Fantasy Stats
              </Typography>
              <ToggleButtonGroup
                id="sort-direction-toggle"
                onChange={(event, newValue) => this.setState({ statsDisplay: newValue })}
                value={statsDisplay}
                exclusive
                style={{ float: 'right', margin: 8 }}
              >
                <ToggleButton key="option-raw" value>
                  Raw Totals
                </ToggleButton>
                <ToggleButton key="option-pts" value={false}>
                  Fantasy Pts
                </ToggleButton>
              </ToggleButtonGroup>
              <Grid item xs={12}>
                <Grid container alignItems="flex-end" justify="center">
                  {Object.keys(playerFields).map((field) => (
                    <Grid item xs={1}>
                      <Typography variant="h6" onClick={() => this.handleSortFieldChange(field)}>
                        {playerFields[field].friendly}
                        {sortField === field && (<ArrowDropDownIcon style={sortDirection ? null : { transform: 'scaleY(-1)' }} />)}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container alignItems="center" justify="center">
                  <Grid item xs={1} onClick={() => this.handleSortFieldChange('name')}>
                    {' '}
                  </Grid>
                  <Grid item xs={1} onClick={() => this.handleSortFieldChange('points')}>
                    {' '}
                  </Grid>
                  <Grid item xs={1} onClick={() => this.handleSortFieldChange('value')}>
                    {' '}
                  </Grid>
                  {Object.keys(fieldValues).map((field) => (
                    <Grid item xs={1}>
                      <Typography variant="h6" style={{ fontWeight: 100 }} onClick={() => this.handleSortFieldChange(field)}>
                        {fieldValues[field]}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
              {playerRows}
            </Paper>
          </Grid>
        )}
      </>
    );
  }
}

FantasyPlayers.propTypes = {
  // eslint-disable-next-line react/no-unused-prop-types
  classes: PropTypes.string,
  season: PropTypes.number,
  // eslint-disable-next-line react/forbid-prop-types
  theme: PropTypes.object.isRequired,
};
FantasyPlayers.defaultProps = defaultProps;

export default withTheme(paperStyles(FantasyPlayers));
