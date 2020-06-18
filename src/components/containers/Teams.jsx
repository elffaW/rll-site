import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Grid, CircularProgress, Typography, Button, Paper,
} from '@material-ui/core';

import BaseApp from './BaseApp';
import TeamCard from '../TeamCard';
import PageHeader from '../PageHeader';
import GameCardCompact from '../GameCardCompact';
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
    };
  }

  componentDidMount() {
    // update data?
    this.getData();
  }

  getData = () => {
    Promise.all([api.getAllPlayers(), api.getAllTeams(), api.getAllGames()]).then((results) => {
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
        playerC.team = team;
        tempTeam.members = [playerA, playerB, playerC];
        return tempTeam;
      });

      const games = allGames.map((game) => game.data);
      games.sort((a, b) => new Date(a.gameTime) - new Date(b.gameTime)); // earlier game times first
      const gamesByTeam = {};
      teams.forEach((team) => {
        team.logo = require(`../../images/LOGO_${team.name}.png`); // eslint-disable-line
        gamesByTeam[team.id] = [];
        games.forEach((game) => {
          if (parseInt(game.homeTeamId, 10) === parseInt(team.id, 10)) {
            const homeTeam = team;
            const awayTeam = teams.find((tempTeam) => parseInt(tempTeam.id, 10) === parseInt(game.awayTeamId, 10));
            gamesByTeam[team.id].push({ homeTeam, awayTeam, ...game });
          } else if (parseInt(game.awayTeamId, 10) === parseInt(team.id, 10)) {
            const homeTeam = teams.find((tempTeam) => parseInt(tempTeam.id, 10) === parseInt(game.homeTeamId, 10));
            const awayTeam = team;
            gamesByTeam[team.id].push({ homeTeam, awayTeam, ...game });
          }
        });
      });
      this.setState({ teams: teamsWithPlayers, gamesByTeam, loading: false });
    });
  }

  render() {
    const { teams, gamesByTeam, loading } = this.state;
    const { classes, match } = this.props;
    const { params } = match;
    const { teamName } = params;

    let curTeam;
    if (teamName) {
      curTeam = teams.find((team) => team.name.toLowerCase() === teamName.toLowerCase());
    }

    return (
      <BaseApp>
        <PageHeader headerText="RLL Season 2 Teams" />
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
                <TeamCard team={curTeam} showDetails />
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
              <TeamCard team={team} />
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
