import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Grid, Paper, Typography, Tooltip, CircularProgress, Button,
} from '@material-ui/core';
import ReactPlayer from 'react-player';

import BaseApp, { SEASONS } from './BaseApp';
import Standings from '../Standings';
import PlayoffSchedule from '../PlayoffSchedule';
import GameCardSingleRow from '../GameCardSingleRow';
import GameCardCompact from '../GameCardCompact';
import PageHeader from '../PageHeader';
import SeasonSelector from '../SeasonSelector';
import { styles as paperStyles } from '../../styles/themeStyles';
// import { timezoneLookup } from '../utils/dateUtils';
import api from '../utils/api';

import networkPromo from '../../videos/NetworkPromo_S1.mp4';

export const CURRENT_GAME_WEEK = '5';
const defaultProps = {
  classes: '',
};

class Dashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      games: [],
      loading: true,
      season: SEASONS[SEASONS.length - 1], // default to the last season in the list
    };
  }

  componentDidMount() {
    // get all data for this page

    // get the schedule of games
    this.getData();
  }

  getData = (newSeason) => {
    const { season } = this.state;
    const seasonQuery = newSeason || season;

    Promise.all([api.getGamesBySeason(seasonQuery), api.getTeamsBySeason(seasonQuery)]).then((results) => {
      const allGames = results[0];
      const teamsData = results[1];
      const games = allGames.map((game) => game.data);
      // const curWeekGames = games.filter((game) => game.gameWeek === CURRENT_GAME_WEEK);
      const remainingGames = games.filter((game) => game.homeTeamScoreA === '');
      remainingGames.sort((a, b) => new Date(a.gameTime) - new Date(b.gameTime)); // earlier game times first
      remainingGames.sort((a, b) => (a.id - b.id)); // earlier ids first
      const curWeekGames = remainingGames.slice(0, 12); // show next 12 games - assumes 12 games per week

      const allTeams = teamsData.map((team) => team.data);
      // disable these lint issues: import/no-dynamic-require global-require
      // eslint-disable-next-line
      allTeams.forEach((team) => team.logo = require(`../../images/LOGO_${team.name.toUpperCase()}.png`));
      const gamesWithTeams = curWeekGames.map((game) => {
        const { ...tempGame } = game;
        tempGame.homeTeam = allTeams.find((team) => (
          parseInt(team.id, 10) === parseInt(tempGame.homeTeamId, 10) && team.season === tempGame.season));
        tempGame.awayTeam = allTeams.find((team) => (
          parseInt(team.id, 10) === parseInt(tempGame.awayTeamId, 10) && team.season === tempGame.season));
        return tempGame;
      });

      this.setState({ games: gamesWithTeams, loading: false });
    });
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
    const { games, loading, season } = this.state;
    const { classes } = this.props;
    // show twitch stream on fridays, I guess
    // TODO: integrate with twitch API to get stream status
    //       and show the twitch stream if live
    const showTwitch = new Date().getDay() === 5;
    const vidUrl = showTwitch ? 'https://www.twitch.tv/elffawm' : networkPromo;
    const lightPlayer = !showTwitch;
    const tooltipText = showTwitch ? '' : 'Click to get hyped';
    const streamHeight = showTwitch ? 800 : '';

    console.log(games);

    return (
      <BaseApp>
        <Grid container spacing={2} justify="center">
          <Grid item xs={12}>
            <PageHeader headerText="Welcome to the Rocket League League league site!" />
          </Grid>
          <Grid item xs={12}>
            <SeasonSelector
              season={season}
              handleSeasonChange={this.handleSeasonChange}
              forceRefresh={this.refreshData}
            />
            <Standings season={season} />
          </Grid>
          <Grid item xs={12} style={{ width: '100%' }}>
            <Paper className={classes.paper}>
              <Tooltip title={tooltipText}>
                <ReactPlayer url={vidUrl} light={lightPlayer} controls width="" height={streamHeight} />
              </Tooltip>
            </Paper>
          </Grid>
          {/* eslint-disable no-nested-ternary */}
          {loading ? (
            <span style={{ textAlign: 'center' }}>
              <CircularProgress color="secondary" />
              <Typography>Loading Schedule...</Typography>
              <Button onClick={this.getData}>Taking forever?</Button>
            </span>
          ) : (
            games.length < 1 ? (
              <Grid container spacing={2} alignItems="flex-start" justify="flex-start">
                <Paper className={classes.paddedPaper}>
                  <Typography
                    variant="h4"
                    style={{
                      fontVariant: 'small-caps', fontWeight: 700, marginLeft: 32, marginTop: 16,
                    }}
                  >
                    No upcoming games this season
                  </Typography>
                </Paper>
              </Grid>
            ) : (
              <Grid container spacing={2} alignItems="flex-start" justify="flex-start">
                <Paper className={classes.paddedPaper}>
                  <Typography
                    variant="h4"
                    style={{
                      fontVariant: 'small-caps', fontWeight: 700, marginLeft: 32, marginTop: 16,
                    }}
                  >
                    {`Upcoming games ${games[0].gameTime.split(' ')[0]}`}
                  </Typography>
                  <Grid container direction="row" alignItems="center" justify="center">
                    <Grid item xs={5}>
                      <Typography
                        variant="h5"
                        style={{
                          fontVariant: 'small-caps', fontWeight: 700, marginLeft: 32, marginTop: 16,
                        }}
                      >
                          GONGSHOW 1
                      </Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography className={classes.gameSubtitle} style={{ fontSize: '1.5rem', color: 'initial' }}>
                        {games[0].arena}
                      </Typography>
                    </Grid>
                    <Grid item xs={5}>
                      <Typography
                        variant="h5"
                        style={{
                          fontVariant: 'small-caps', fontWeight: 700, marginLeft: 32, marginTop: 16,
                        }}
                      >
                          GONGSHOW 2
                      </Typography>
                    </Grid>
                    {games.map((game, idx) => (
                      // <GameCardSingleRow
                      //   gameNum={game.id}
                      //   team1={game.homeTeam}
                      //   team2={game.awayTeam}
                      //   time={game.gameTime}
                      //   arena={game.arena}
                      //   isPlayoffs={!!(game.homeTeamScoreC && game.awayTeamScoreC)}
                      //   homeScoreA={game.homeTeamScoreA}
                      //   homeScoreB={game.homeTeamScoreB}
                      //   homeScoreC={game.homeTeamScoreC}
                      //   awayScoreA={game.awayTeamScoreA}
                      //   awayScoreB={game.awayTeamScoreB}
                      //   awayScoreC={game.awayTeamScoreC}
                      // />
                      <>
                        <Grid item xs={5}>
                          <Paper className={classes.darkerPaper}>
                            <GameCardCompact
                              gameNum={game.id}
                              team1={game.homeTeam}
                              team2={game.awayTeam}
                                // time={game.gameTime}
                                // arena={game.arena}
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
                        {!(idx % 2) && (
                        <Grid item xs={2}>
                          <Typography className={classes.gameSubtitle} style={{ fontSize: '1.4rem' }}>
                            {`${game.gameTime.split(' ')[1]} ${game.gameTime.split(' ')[2]}`}
                          </Typography>
                        </Grid>
                        )}
                      </>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            )
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
