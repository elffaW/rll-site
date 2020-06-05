import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Grid, CircularProgress, Typography, Paper, Button,
} from '@material-ui/core';

import BaseApp from './BaseApp';
import GameCard from '../GameCard';
import PageHeader from '../PageHeader';
import api from '../utils/api';
import { CURRENT_GAME_WEEK } from './Dashboard';
import { styles as paperStyles } from '../../styles/themeStyles';

const defaultProps = {
  classes: '',
};

class Schedule extends Component {
  constructor(props) {
    super(props);

    // get all data for this page
    // this.setState({ games: gamesData });

    this.state = {
      games: [],
      loading: true,
    };
  }

  componentDidMount() {
    // get page data
    this.getData();
  }

  getData = () => {
    Promise.all([api.getAllGames(), api.getAllTeams()]).then((results) => {
      const allGames = results[0];
      const teamsData = results[1];
      const games = allGames.map((game) => game.data);
      games.sort((a, b) => new Date(a.gameTime) - new Date(b.gameTime)); // earlier game times first

      const allTeams = teamsData.map((team) => team.data);
      const gamesWithTeams = games.map((game) => {
        const { ...tempGame } = game;
        tempGame.homeTeam = allTeams.find((team) => parseInt(team.id, 10) === parseInt(tempGame.homeTeamId, 10));
        tempGame.awayTeam = allTeams.find((team) => parseInt(team.id, 10) === parseInt(tempGame.awayTeamId, 10));
        return tempGame;
      });

      this.setState({ games: gamesWithTeams, loading: false });
    });
  }

  render() {
    const { classes } = this.props;
    const { games, loading } = this.state;

    const gameCards = [];
    const numWeeks = 4;
    for (let i = 1; i <= numWeeks; i++) {
      const curWeekGames = games.filter((game) => parseInt(game.gameWeek, 10) === i);
      const weekComplete = parseInt(CURRENT_GAME_WEEK, 10) > i ? 'COMPLETE' : '';
      gameCards.push(
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Grid container alignItems="center" justify="space-around">
              <Grid item xs={12}>
                <Typography
                  variant="h4"
                  style={{
                    fontVariant: 'small-caps', fontWeight: 700, paddingTop: 16, paddingBottom: 16,
                  }}
                >
                  {`GameWeek ${i} ${weekComplete}`}
                </Typography>
              </Grid>
              {curWeekGames.map((game) => (
                <GameCard game={game} />
              ))}
            </Grid>
          </Paper>
        </Grid>,
      );
    }
    /*
      {games.map((game) => (
        <GameCard game={game} />
      ))}
    */
    return (
      <BaseApp>
        <PageHeader headerText="RLL Season 2 Schedule" />
        { loading ? (
          <>
            <CircularProgress color="secondary" />
            <Typography>Loading Schedule...</Typography>
            <Button onClick={this.getData}>Taking forever?</Button>
          </>
        ) : (
          <Grid container spacing={5} alignItems="flex-start" justify="flex-start">
            {gameCards}
          </Grid>
        )}
      </BaseApp>
    );
  }
}

Schedule.propTypes = {
  classes: PropTypes.string,
};
Schedule.defaultProps = defaultProps;

export default paperStyles(Schedule);
