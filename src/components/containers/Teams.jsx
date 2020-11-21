import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Grid, CircularProgress, Typography, Button, Paper,
} from '@material-ui/core';

import BaseApp, { SEASONS } from './BaseApp';
import TeamCard from '../TeamCard';
import PageHeader from '../PageHeader';
import GameCardCompact from '../GameCardCompact';
import SeasonSelector from '../SeasonSelector';
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
      gamesByTeam: {},
      loading: true,
      season: SEASONS[SEASONS.length - 1], // default to the last season in the list
    };
  }

  componentDidMount() {
    // update data?
    this.getData();
  }

  getData = (newSeason) => {
    const { season } = this.state;
    const seasonQuery = newSeason || season;
    const { match } = this.props;
    const { params } = match;
    const { teamName } = params;

    if (teamName) {
      api.getAllTeams().then((allTeams) => {
        const teams = allTeams.map((team) => team.data);
        const curTeam = teams.find((team) => team.name.toLowerCase() === teamName.toLowerCase());

        Promise.all([
          api.getPlayersBySeason(curTeam.season),
          api.getGamesBySeason(curTeam.season),
        ]).then((results) => {
          const allPlayers = results[0];
          const allGames = results[1];
          const seasonTeams = teams.filter((team) => team.season === curTeam.season);
          seasonTeams.sort((a, b) => a.rank - b.rank); // sort with lower rank at top

          const players = allPlayers.map((player) => player.data);
          const teamsWithPlayers = seasonTeams.map((team) => {
            const { ...tempTeam } = team;
            const playerA = players.find((player) => parseInt(player.id, 10) === parseInt(tempTeam.members[0], 10));
            const playerB = players.find((player) => parseInt(player.id, 10) === parseInt(tempTeam.members[1], 10));
            const playerC = players.find((player) => parseInt(player.id, 10) === parseInt(tempTeam.members[2], 10));
            playerA.team = team;
            playerB.team = team;
            if (!playerC) { // in case of 2-player teams
              tempTeam.members = [playerA, playerB];
            } else {
              playerC.team = team;
              tempTeam.members = [playerA, playerB, playerC];
            }
            return tempTeam;
          });

          const games = allGames.map((game) => game.data);
          games.sort((a, b) => new Date(a.gameTime) - new Date(b.gameTime)); // earlier game times first
          const gamesByTeam = {};
          seasonTeams.forEach((team) => {
            team.logo = require(`../../images/LOGO_${team.name.toUpperCase()}.png`); // eslint-disable-line
            gamesByTeam[team.id] = [];
            games.forEach((game) => {
              if (parseInt(game.homeTeamId, 10) === parseInt(team.id, 10) && team.season === game.season) {
                const homeTeam = team;
                const awayTeam = seasonTeams.find((tempTeam) => parseInt(tempTeam.id, 10) === parseInt(game.awayTeamId, 10) && team.season === game.season);
                gamesByTeam[team.id].push({ homeTeam, awayTeam, ...game });
              } else if (parseInt(game.awayTeamId, 10) === parseInt(team.id, 10) && team.season === game.season) {
                const homeTeam = seasonTeams.find((tempTeam) => parseInt(tempTeam.id, 10) === parseInt(game.homeTeamId, 10) && team.season === game.season);
                const awayTeam = team;
                gamesByTeam[team.id].push({ homeTeam, awayTeam, ...game });
              }
            });
          });
          this.setState({
            teams: teamsWithPlayers, gamesByTeam, loading: false, season: curTeam.season,
          });
        });
      });
    } else {
      Promise.all([
        api.getPlayersBySeason(seasonQuery),
        api.getTeamsBySeason(seasonQuery),
        api.getGamesBySeason(seasonQuery),
      ]).then((results) => {
        const allPlayers = results[0];
        const allTeams = results[1];
        const allGames = results[2];
        const teams = allTeams.map((team) => team.data);
        teams.sort((a, b) => a.rank - b.rank); // sort with lower rank at top

        const players = allPlayers.map((player) => player.data);
        const teamsWithPlayers = teams.map((team) => {
          const { ...tempTeam } = team;
          const playerA = players.find((player) => parseInt(player.id, 10) === parseInt(tempTeam.members[0], 10));
          const playerB = players.find((player) => parseInt(player.id, 10) === parseInt(tempTeam.members[1], 10));
          const playerC = players.find((player) => parseInt(player.id, 10) === parseInt(tempTeam.members[2], 10));
          playerA.team = team;
          playerB.team = team;
          if (!playerC) { // in case of 2-player teams
            tempTeam.members = [playerA, playerB];
          } else {
            playerC.team = team;
            tempTeam.members = [playerA, playerB, playerC];
          }
          return tempTeam;
        });

        const games = allGames.map((game) => game.data);
        games.sort((a, b) => new Date(a.gameTime) - new Date(b.gameTime)); // earlier game times first
        const gamesByTeam = {};
        teams.forEach((team) => {
          team.logo = require(`../../images/LOGO_${team.name.toUpperCase()}.png`); // eslint-disable-line
          gamesByTeam[team.id] = [];
          games.forEach((game) => {
            if (parseInt(game.homeTeamId, 10) === parseInt(team.id, 10) && team.season === game.season) {
              const homeTeam = team;
              const awayTeam = teams.find((tempTeam) => parseInt(tempTeam.id, 10) === parseInt(game.awayTeamId, 10) && team.season === game.season);
              gamesByTeam[team.id].push({ homeTeam, awayTeam, ...game });
            } else if (parseInt(game.awayTeamId, 10) === parseInt(team.id, 10) && team.season === game.season) {
              const homeTeam = teams.find((tempTeam) => parseInt(tempTeam.id, 10) === parseInt(game.homeTeamId, 10) && team.season === game.season);
              const awayTeam = team;
              gamesByTeam[team.id].push({ homeTeam, awayTeam, ...game });
            }
          });
        });
        this.setState({
          teams: teamsWithPlayers, gamesByTeam, loading: false, season: seasonQuery,
        });
      });
    }
  }

  handleSeasonChange = (event) => {
    const { season } = this.state;
    const newSeason = parseInt(event.target.value, 10);
    if (season !== newSeason) {
      this.setState({ season: newSeason });
      this.getData(newSeason);
    }
  }

  refreshData = () => {
    this.getData();
  }

  render() {
    const {
      teams, gamesByTeam, loading, season,
    } = this.state;
    const { classes, match } = this.props;
    const { params } = match;
    const { teamName } = params;

    let curTeam;
    let winlossdraw = {};

    if (!loading && teams && teams.length > 0) {
      teams.map((curTeam) => {
        winlossdraw[curTeam.id] = gamesByTeam[curTeam.id].map((game) => {
          const homeScoreA = game.homeTeamScoreA;
          const homeScoreB = game.homeTeamScoreB;
          const homeScoreC = game.homeTeamScoreC;
          const awayScoreA = game.awayTeamScoreA;
          const awayScoreB = game.awayTeamScoreB;
          const awayScoreC = game.awayTeamScoreC;
  
          const isPlayoffs = !!(game.homeTeamScoreC && game.awayTeamScoreC);
  
          const hasScores = !!(parseInt(homeScoreA, 10)
            || parseInt(awayScoreA, 10)
            || parseInt(homeScoreB, 10)
            || parseInt(awayScoreB, 10)
            || parseInt(homeScoreC, 10)
            || parseInt(awayScoreC, 10));
          let homeWinnerA = false;
          let homeWinnerB = false;
          let homeWinnerC = false;
          let homeWinnerOverall = false;
          let awayWinnerOverall = false;
          if (hasScores) {
            homeWinnerA = parseInt(homeScoreA, 10) > parseInt(awayScoreA, 10);
            homeWinnerB = parseInt(homeScoreB, 10) > parseInt(awayScoreB, 10);
            homeWinnerC = parseInt(homeScoreC, 10) > parseInt(awayScoreC, 10);
  
            homeWinnerOverall = isPlayoffs
              ? ((homeWinnerA && homeWinnerB) || (homeWinnerA && homeWinnerC) || (homeWinnerB && homeWinnerC))
              : homeWinnerA && homeWinnerB;
            awayWinnerOverall = isPlayoffs
              ? ((!homeWinnerA && !homeWinnerB) || (!homeWinnerA && !homeWinnerC) || (!homeWinnerB && !homeWinnerC))
              : !homeWinnerA && !homeWinnerB;
          }
          if (curTeam.id === game.homeTeamId) {
            if (homeWinnerOverall) {
              return `${game.gameWeek}:${game.awayTeam.name.toUpperCase()}:W`;
            }
            if (awayWinnerOverall) {
              return `${game.gameWeek}:${game.awayTeam.name.toUpperCase()}:L`;
            }
            if (!hasScores) {
              return `${game.gameWeek}:${game.awayTeam.name.toUpperCase()}:-`;
            }
            return `${game.gameWeek}:${game.awayTeam.name.toUpperCase()}:D`;
          } // else {
          if (homeWinnerOverall) {
            return `${game.gameWeek}:${game.homeTeam.name.toUpperCase()}:L`;
          }
          if (awayWinnerOverall) {
            return `${game.gameWeek}:${game.homeTeam.name.toUpperCase()}:W`;
          }
          if (!hasScores) {
            return `${game.gameWeek}:${game.homeTeam.name.toUpperCase()}:-`;
          }
          return `${game.gameWeek}:${game.homeTeam.name.toUpperCase()}:D`;
          // }
        });
      })
    }

    let lastGW = 0;
    const gameweeks = [];
    if (Object.keys(winlossdraw).length > 0 && winlossdraw[teams[0].id].length > 0) {
      teams.map((team) => {
        winlossdraw[team.id] = winlossdraw[team.id].filter((wld) => !!wld);
        if (winlossdraw[team.id][winlossdraw[team.id].length - 1]) {
          // eslint-disable-next-line prefer-destructuring
          lastGW = winlossdraw[team.id][winlossdraw[team.id].length - 1].split(':')[0];
          for (let i = 1; i <= lastGW; i++) {
            gameweeks.push(i);
          }
        }
      });
    }

    return (
      <BaseApp>
        <PageHeader headerText="RLL Teams" />
        <br />
        <SeasonSelector
          season={season}
          disabled={!!curTeam}
          handleSeasonChange={this.handleSeasonChange}
          forceRefresh={this.refreshData}
        />
        { loading ? (
          <>
            <CircularProgress color="secondary" />
            <Typography>Loading Teams...</Typography>
            <Button onClick={this.getData}>Taking forever?</Button>
          </>
        ) : (
          <Grid container spacing={4} alignItems="flex-start" justify="flex-start">
            {curTeam ? (
              <>
                <TeamCard team={curTeam} totalTeams={teams.length} showDetails gameweeks={gameweeks} winlossdraw={winlossdraw} />
                {gamesByTeam[curTeam.id].map((game) => (
                  <Grid item xs={6} xl={4}>
                    <Paper className={classes.darkPaper}>
                      <GameCardCompact
                        team1={game.homeTeam}
                        team2={game.awayTeam}
                        time={game.gameTime}
                        arena={game.arena}
                        isPlayoffs={!!(game.homeTeamScoreC && game.awayTeamScoreC)}
                        homeScoreA={game.homeTeamScoreA}
                        homeScoreB={game.homeTeamScoreB}
                        homeScoreC={game.homeTeamScoreC}
                        awayScoreA={game.awayTeamScoreA}
                        awayScoreB={game.awayTeamScoreB}
                        awayScoreC={game.awayTeamScoreC}
                      />
                    </Paper>
                  </Grid>
                ))}
              </>
            ) : (teams.map((team) => (
              <TeamCard team={team} gameweeks={gameweeks} winlossdraw={winlossdraw[team.id]} />
            )))}
          </Grid>
        )}
      </BaseApp>
    );
  }
}

Teams.propTypes = {
  // eslint-disable-next-line react/no-unused-prop-types
  classes: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  match: PropTypes.object.isRequired,
};
Teams.defaultProps = defaultProps;

export default paperStyles(Teams);
