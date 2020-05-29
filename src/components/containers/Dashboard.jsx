import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Grid, Paper, Typography, Tooltip,
} from '@material-ui/core';
import ReactPlayer from 'react-player';

import BaseApp from './BaseApp';
import { gamesData } from './Schedule';
import { teamsData } from './Teams';
import GameCard from '../GameCard';
import { styles as paperStyles } from '../../styles/themeStyles';
import { timezoneLookup } from '../utils/dateUtils';

import networkPromo from '../../videos/NetworkPromo.mp4';

const defaultProps = {
  classes: '',
};

class Dashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  componentDidMount() {
    // get all data for this page
  }

  render() {
    const { classes } = this.props;
    // show twitch stream on fridays, I guess
    // TODO: integrate with twitch API to get stream status
    //       and show the twitch stream if live
    const showTwitch = new Date().getDay() === 5;
    const vidUrl = showTwitch ? 'https://www.twitch.tv/elffawm' : networkPromo;
    const lightPlayer = !showTwitch;
    const tooltipText = showTwitch ? '' : 'Click to get hyped';
    const streamHeight = showTwitch ? 800 : '';
    const rightNow = new Date();
    // find first game where gameTime is before now
    let prevGame = gamesData.find((game) => new Date(game.gameTime) < rightNow);
    if (!prevGame) {
      prevGame = {
        id: 0,
      };
    }
    // get the game after that one (by ID)
    const curGame = gamesData.find((game) => game.id === (prevGame.id + 1));
    const homeTeam = teamsData.find((team) => team.id === curGame.homeTeam);
    const awayTeam = teamsData.find((team) => team.id === curGame.awayTeam);
    const gameTime = new Date(curGame.gameTime).toLocaleString() + timezoneLookup(new Date().getTimezoneOffset());
    return (
      <BaseApp>
        <Grid container spacing={2} justify="center">
          <Grid item xs={12}>
            <Typography variant="h3" style={{ fontVariant: 'small-caps' }}>
              Welcome to the Rocket League League league site!
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h5" style={{ fontVariant: 'small-caps' }}>
              Current (or upcoming) Game:&nbsp;
              <span style={{ color: 'whitesmoke' }}>{homeTeam.name}</span>
              &nbsp;vs&nbsp;
              <span style={{ color: 'whitesmoke' }}>{awayTeam.name}</span>
              &nbsp;at&nbsp;
              <span style={{ color: 'whitesmoke' }}>{gameTime}</span>
            </Typography>
          </Grid>
          <Grid item xs={12} style={{ width: '100%' }}>
            <Paper className={classes.paper}>
              <Tooltip title={tooltipText}>
                <ReactPlayer url={vidUrl} light={lightPlayer} controls width="" height={streamHeight} />
              </Tooltip>
            </Paper>
          </Grid>
          <Grid container spacing={2} alignItems="flex-start" justify="flex-start">
            {gamesData.map((game) => (
              <GameCard game={game} />
            ))}
          </Grid>
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
