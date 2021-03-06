import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  Grid, CircularProgress, Typography, Button, Paper, Avatar,
} from '@material-ui/core';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { withTheme } from '@material-ui/core/styles';

import api from './utils/api';
import { styles as paperStyles } from '../styles/themeStyles';

import { SEASONS } from './containers/BaseApp';
import { convertGamesToMatches } from './utils/dataUtils';

const champLogo = require('../images/CHAMPION.png');
const runnerUpLogo = require('../images/RUNNERUP.png');

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
      gamesByTeam: {},
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
    Promise.all([
      api.getTeamsBySeason(season),
      api.getGamesBySeason(season),
      api.getAllSeasons(),
    ]).then((results) => {
      const allTeams = results[0];
      const allGames = results[1];
      const allSeasons = results[2];
      const teams = allTeams.map((team) => team.data);
      const games = allGames.map((game) => game.data);
      const seasons = allSeasons.map((s) => s.data);

      teams.sort((a, b) => a.rank - b.rank); // sort with lower (better) rank at top

      games.sort((a, b) => new Date(a.gameTime) - new Date(b.gameTime)); // earlier game times first
      const completedGames = games.filter((game) => !!game.homeTeamScoreA && !!game.homeTeamScoreB);
      let completedMatches = [];
      if (completedGames.length < 1) {
        completedMatches = convertGamesToMatches(games)?.filter((match) => match.matchComplete);
      }

      const gamesByTeam = {};
      teams.forEach((team) => {
        team.logo = require(`../images/LOGO_${team.name.toUpperCase()}.png`); // eslint-disable-line
        gamesByTeam[team.id] = [];
        if (completedGames.length > 0) {
          // S4 and earlier
          completedGames.forEach((game) => {
            const {
              homeTeamScoreA, homeTeamScoreB, awayTeamScoreA, awayTeamScoreB,
            } = game;
            const homeWinA = parseInt(homeTeamScoreA, 10) > parseInt(awayTeamScoreA, 10);
            const homeWinB = parseInt(homeTeamScoreB, 10) > parseInt(awayTeamScoreB, 10);
            // eslint-disable-next-line no-nested-ternary
            const matchResult = homeWinA && homeWinB ? 'W' : homeWinA || homeWinB ? 'D' : 'L';
            if (parseInt(game.homeTeamId, 10) === parseInt(team.id, 10) && team.season === game.season) {
              const homeTeam = team;
              const awayTeam = teams.find(
                (tempTeam) => (
                  parseInt(tempTeam.id, 10) === parseInt(game.awayTeamId, 10) && team.season === game.season
                ),
              );
              gamesByTeam[team.id].push({
                homeTeam, awayTeam, matchResult, ...game,
              });
            } else if (parseInt(game.awayTeamId, 10) === parseInt(team.id, 10) && team.season === game.season) {
              const homeTeam = teams.find(
                (tempTeam) => (
                  parseInt(tempTeam.id, 10) === parseInt(game.homeTeamId, 10) && team.season === game.season
                ),
              );
              const awayTeam = team;
              // eslint-disable-next-line no-nested-ternary
              // matchResult = matchResult === 'W' ? 'L' : matchResult === 'L' ? 'W' : 'D';
              gamesByTeam[team.id].push({
                homeTeam, awayTeam, matchResult, ...game,
              });
            }
          });
        } else if (completedMatches.length > 0) {
          // S5 and later
          completedMatches.forEach((match) => {
            const {
              matchComplete, matchResult, homeTeamId, awayTeamId, season: matchSeason,
            } = match;
            // shouldn't be here if matchComplete is false, but might as well check...
            if (matchComplete && team.season === matchSeason) {
              if (parseInt(homeTeamId, 10) === parseInt(team.id, 10)) {
                const homeTeam = team;
                const awayTeam = teams.find(
                  (tempTeam) => parseInt(tempTeam.id, 10) === parseInt(awayTeamId, 10) && team.season === matchSeason,
                );
                gamesByTeam[team.id].push({
                  homeTeam, awayTeam, ...match, matchResult,
                });
              } else if (parseInt(awayTeamId, 10) === parseInt(team.id, 10)) {
                const homeTeam = teams.find(
                  (tempTeam) => parseInt(tempTeam.id, 10) === parseInt(homeTeamId, 10) && team.season === matchSeason,
                );
                const awayTeam = team;
                // eslint-disable-next-line no-nested-ternary
                // const awayResult = matchResult === 'W' ? 'L' : matchResult === 'L' ? 'W' : 'D';
                gamesByTeam[team.id].push({
                  homeTeam, awayTeam, ...match, matchResult, // : awayResult,
                });
              }
            }
          });
        }

        /* eslint-disable no-param-reassign */
        team.isChampion = false;
        team.isRunnerUp = false;
        const teamSeason = seasons.find((s) => s.id === team.season);
        if (teamSeason.champion === team.id) {
          team.isChampion = true;
        } else if (teamSeason.runnerUp === team.id) {
          team.isRunnerUp = true;
        }
        /* eslint-enable no-param-reassign */

        gamesByTeam[team.id] = gamesByTeam[team.id].slice(-4);
        // if (team.id === 3) {
        //   console.log(gamesByTeam[team.id]);
        // }
      });

      this.setState({
        teams, gamesByTeam, loading: false, sortField: 'rank', sortDirection: true,
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
    const { classes, season, theme } = this.props;
    const {
      teams, gamesByTeam, loading, sortField, sortDirection,
    } = this.state;

    const teamRows = [];
    for (let i = 0; i < teams.length; i++) {
      const team = teams[i];
      teamRows.push(
        <Grid item xs={12} style={!(i % 2) ? { backgroundColor: theme.palette.secondary.light } : {}}>
          <Grid container alignItems="center" justify="flex-start">
            <Grid item xs>
              <Typography variant="h4">
                {team.rank}
              </Typography>
            </Grid>
            <Grid item xs>
              <Avatar src={team.logo} variant="square" style={{ float: 'right', paddingRight: 8 }} />
              {team.isChampion && (
                <Avatar src={champLogo} variant="square" className={`${classes.teamTrophy} ${classes.champTrophy}`} />
              )}
              {team.isRunnerUp && (
                <Avatar src={runnerUpLogo} variant="square" className={`${classes.teamTrophy} ${classes.runnerUpTrophy}`} />
              )}
            </Grid>
            <Grid item xs={2}>
              <Link to={`/teams/${team.name}`} exact>
                <Typography variant="h5" className={classes.teamName} style={{ float: 'left' }}>
                  {team.name}
                </Typography>
              </Link>
            </Grid>
            <Grid item xs>
              <Typography variant="body1" className={classes.teamRecord}>
                {team.wins}
              </Typography>
            </Grid>
            <Grid item xs>
              <Typography variant="body1" className={classes.teamRecord}>
                {team.losses}
              </Typography>
            </Grid>
            <Grid item xs>
              <Typography variant="h6" className={classes.teamDesc}>
                {team.points}
              </Typography>
            </Grid>
            <Grid item xs>
              <Typography className={classes.teamDesc}>
                {team.value}
              </Typography>
            </Grid>
            <Grid item xs>
              <Typography className={classes.teamDetails}>{team.goalsFor}</Typography>
            </Grid>
            <Grid item xs>
              <Typography className={classes.teamDetails}>{team.goalsAgainst}</Typography>
            </Grid>
            <Grid item xs>
              <Typography className={classes.teamDetails}>{team.plusMinus}</Typography>
            </Grid>
            <Grid item xs>
              <Grid container direction="row" alignItems="center" justify="flex-end">
                {gamesByTeam[team.id].map((game) => {
                  let bgColor = 'blue';
                  if (team.id === game.homeTeamId) {
                    // eslint-disable-next-line no-nested-ternary
                    bgColor = game.matchResult === 'W' ? 'green' : game.matchResult === 'L' ? 'red' : 'blue';
                  } else {
                    // eslint-disable-next-line no-nested-ternary
                    bgColor = game.matchResult === 'W' ? 'red' : game.matchResult === 'L' ? 'green' : 'blue';
                  }
                  return (
                    <Grid item xs>
                      <Avatar
                        src={team.id === game.homeTeamId ? game.awayTeam.logo : game.homeTeam.logo}
                        variant="circle"
                        style={{
                          // eslint-disable-next-line no-nested-ternary
                          height: '1.4rem', width: '1.4rem', backgroundColor: bgColor, filter: 'saturate(50%)',
                        }}
                      />
                    </Grid>
                  );
                })}
              </Grid>
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
          <Grid container alignItems="flex-start" justify="flex-start">
            <Paper className={classes.paper}>
              <Grid item xs={12}>
                <Grid container alignItems="center" justify="flex-start" style={{ fontVariant: 'small-caps' }}>
                  <Grid item xs>
                    <Typography variant="h6" onClick={() => this.handleSortFieldChange('rank')}>
                      Rank
                      {sortField === 'rank' && (<ArrowDropDownIcon style={sortDirection ? null : { transform: 'scaleY(-1)' }} />)}
                    </Typography>
                  </Grid>
                  <Grid item xs>
                    {' '}
                  </Grid>
                  <Grid item xs={2}>
                    <Typography variant="h6" style={{ float: 'left' }} onClick={() => this.handleSortFieldChange('name')}>
                      Team
                      {sortField === 'team' && (<ArrowDropDownIcon style={sortDirection ? null : { transform: 'scaleY(-1)' }} />)}
                    </Typography>
                  </Grid>
                  <Grid item xs>
                    <Typography variant="h6" onClick={() => this.handleSortFieldChange('wins')}>
                      W
                      {sortField === 'wins' && (<ArrowDropDownIcon style={sortDirection ? null : { transform: 'scaleY(-1)' }} />)}
                    </Typography>
                  </Grid>
                  <Grid item xs>
                    <Typography variant="h6" onClick={() => this.handleSortFieldChange('losses')}>
                      L
                      {sortField === 'losses' && (<ArrowDropDownIcon style={sortDirection ? null : { transform: 'scaleY(-1)' }} />)}
                    </Typography>
                  </Grid>
                  <Grid item xs>
                    <Typography variant="h6" onClick={() => this.handleSortFieldChange('points')}>
                      PTS
                      {sortField === 'points' && (<ArrowDropDownIcon style={sortDirection ? null : { transform: 'scaleY(-1)' }} />)}
                    </Typography>
                  </Grid>
                  <Grid item xs>
                    <Typography variant="h6" onClick={() => this.handleSortFieldChange('value')}>
                      Value
                      {sortField === 'value' && (<ArrowDropDownIcon style={sortDirection ? null : { transform: 'scaleY(-1)' }} />)}
                    </Typography>
                  </Grid>
                  <Grid item xs>
                    <Typography variant="h6" onClick={() => this.handleSortFieldChange('goalsFor')}>
                      GF
                      {sortField === 'goalsFor' && (<ArrowDropDownIcon style={sortDirection ? null : { transform: 'scaleY(-1)' }} />)}
                    </Typography>
                  </Grid>
                  <Grid item xs>
                    <Typography variant="h6" onClick={() => this.handleSortFieldChange('goalsAgainst')}>
                      GA
                      {sortField === 'goalsAgainst' && (<ArrowDropDownIcon style={sortDirection ? null : { transform: 'scaleY(-1)' }} />)}
                    </Typography>
                  </Grid>
                  <Grid item xs>
                    <Typography variant="h6" onClick={() => this.handleSortFieldChange('plusMinus')}>
                      +/-
                      {sortField === 'plusMinus' && (<ArrowDropDownIcon style={sortDirection ? null : { transform: 'scaleY(-1)' }} />)}
                    </Typography>
                  </Grid>
                  <Grid item xs>
                    <Typography variant="h6">
                      Form
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
  // eslint-disable-next-line react/forbid-prop-types
  theme: PropTypes.object.isRequired,
};
Standings.defaultProps = defaultProps;

export default withTheme(paperStyles(Standings));
