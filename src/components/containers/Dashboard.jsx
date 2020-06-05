import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Grid, Paper, Typography, Tooltip, CircularProgress, Button,
} from '@material-ui/core';
import ReactPlayer from 'react-player';

import BaseApp from './BaseApp';
// import { gamesData } from './Schedule';
// import { teamsData } from './Teams';
import GameCard from '../GameCard';
import PageHeader from '../PageHeader';
import { styles as paperStyles } from '../../styles/themeStyles';
// import { timezoneLookup } from '../utils/dateUtils';
import api from '../utils/api';

import networkPromo from '../../videos/NetworkPromo_S1.mp4';

export const CURRENT_GAME_WEEK = '2';
const defaultProps = {
  classes: '',
};

class Dashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      games: [],
      loading: true,
    };
  }

  componentDidMount() {
    // get all data for this page

    // get the schedule of games
    this.getData();
  }

  getData = () => {
    Promise.all([api.getAllGames(), api.getAllTeams()]).then((results) => {
      const allGames = results[0];
      const teamsData = results[1];
      const games = allGames.map((game) => game.data);
      const curWeekGames = games.filter((game) => game.gameWeek === CURRENT_GAME_WEEK);
      curWeekGames.sort((a, b) => new Date(a.gameTime) - new Date(b.gameTime)); // earlier game times first

      const allTeams = teamsData.map((team) => team.data);
      const gamesWithTeams = curWeekGames.map((game) => {
        const { ...tempGame } = game;
        tempGame.homeTeam = allTeams.find((team) => parseInt(team.id, 10) === parseInt(tempGame.homeTeamId, 10));
        tempGame.awayTeam = allTeams.find((team) => parseInt(team.id, 10) === parseInt(tempGame.awayTeamId, 10));
        return tempGame;
      });

      this.setState({ games: gamesWithTeams, loading: false });
    });
  }

  render() {
    const { games, loading } = this.state;
    const { classes } = this.props;
    // show twitch stream on fridays, I guess
    // TODO: integrate with twitch API to get stream status
    //       and show the twitch stream if live
    const showTwitch = new Date().getDay() === 5;
    const vidUrl = showTwitch ? 'https://www.twitch.tv/elffawm' : networkPromo;
    const lightPlayer = !showTwitch;
    const tooltipText = showTwitch ? '' : 'Click to get hyped';
    const streamHeight = showTwitch ? 800 : '';

    // attemp to get the current or next upcoming game
    // const rightNow = new Date();
    // // find first game where gameTime is before now
    // let prevGame = games.find((game) => new Date(game.gameTime) < rightNow);
    // if (!prevGame) {
    //   prevGame = {
    //     id: 0,
    //   };
    // }
    // // get the game after that one (by ID)
    // const curGame = games.find((game) => game.id === (prevGame.id + 1));
    // const homeTeam = teams.find((team) => team.id === curGame.homeTeam);
    // const awayTeam = teams.find((team) => team.id === curGame.awayTeam);
    // const gameTime = new Date(curGame.gameTime).toLocaleString() + timezoneLookup(new Date().getTimezoneOffset());
    return (
      <BaseApp>
        <Grid container spacing={2} justify="center">
          <Grid item xs={12}>
            <PageHeader headerText="Welcome to the Rocket League League league site!" />
          </Grid>
          {/* <Grid item xs={12}>
            <Typography variant="h5" style={{ fontVariant: 'small-caps' }}>
              Current (or upcoming) Game:&nbsp;
              <span style={{ color: 'whitesmoke' }}>{homeTeam.name}</span>
              &nbsp;vs&nbsp;
              <span style={{ color: 'whitesmoke' }}>{awayTeam.name}</span>
              &nbsp;at&nbsp;
              <span style={{ color: 'whitesmoke' }}>{gameTime}</span>
            </Typography>
          </Grid> */}
          <Grid item xs={12} style={{ width: '100%' }}>
            <Paper className={classes.paper}>
              <Tooltip title={tooltipText}>
                <ReactPlayer url={vidUrl} light={lightPlayer} controls width="" height={streamHeight} />
              </Tooltip>
            </Paper>
          </Grid>
          { loading ? (
            <>
              <CircularProgress color="secondary" />
              <Typography>Loading Schedule...</Typography>
              <Button onClick={this.getData}>Taking forever?</Button>
            </>
          ) : (
            <Grid container spacing={2} alignItems="flex-start" justify="flex-start">
              {games.map((game) => (
                <GameCard game={game} />
              ))}
            </Grid>
          )}
        </Grid>
      </BaseApp>
    );
  }
}

Dashboard.propTypes = {
  classes: PropTypes.string,
};
Dashboard.defaultProps = defaultProps;

export default paperStyles(Dashboard);
