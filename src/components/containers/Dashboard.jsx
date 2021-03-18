import React, { useEffect, useMemo } from 'react';
import {
  Grid, Paper, Typography, Tooltip, CircularProgress, Button,
} from '@material-ui/core';
import ReactPlayer from 'react-player';
import { useDispatch, useSelector } from 'react-redux';

import BaseApp from './BaseApp';
import Standings from '../Standings';
// import PlayoffSchedule from '../PlayoffSchedule';
// import GameCardSingleRow from '../GameCardSingleRow';
import GameCardCompact from '../GameCardCompact';
import PageHeader from '../PageHeader';
import SeasonSelector from '../SeasonSelector';
import { stylesHook as paperStyles } from '../../styles/themeStyles';
// import { timezoneLookup } from '../utils/dateUtils';
import { selectCurrentSeason, updateSeason } from '../slices/seasonSlice';
import { fetchGames, selectAllGames, selectGamesBySeason } from '../slices/gameSlice';

import networkPromo from '../../videos/NetworkPromo_S1.mp4';

const Dashboard = () => {
  const classes = paperStyles();
  const dispatch = useDispatch();

  const gamesStatus = useSelector((state) => state.games.status);
  const season = useSelector(selectCurrentSeason);

  const seasonNum = season ? season.id : null;

  const allGames = useSelector(selectAllGames);
  const seasonGames = useMemo(() => allGames.filter((g) => g.season === seasonNum), [allGames, seasonNum]);

  /**
   * filterGamesByCurGameweek
   * @param {array} games array of matches
   * @returns filtered array of matches for most recent unfinished gameweek
   */
  const filterGamesByCurGameweek = (games) => {
    if (!games || games.length < 1) {
      return [];
    }
    const remainingGames = games.filter((game) => game.homeTeamScoreA === '' || game.matchComplete === false);
    remainingGames.sort((a, b) => new Date(a.gameTime) - new Date(b.gameTime)); // earlier game times first
    remainingGames.sort((a, b) => (a.id - b.id)); // earlier ids first
    const curWeek = remainingGames.length > 0 ? remainingGames[0].gameWeek : -1; // get the next incomplete gameweek
    return remainingGames.filter((game) => game.gameWeek === curWeek);
  };

  const games = useMemo(() => filterGamesByCurGameweek(seasonGames), [seasonGames, seasonNum]);
  console.log('games', games.length);

  /**
   * populate redux with games from API
   */
  const getData = () => {
    dispatch(fetchGames());
  };

  // useEffect(() => {
  //   if (seasonsStatus === 'success' && gamesStatus === 'idle') {
  //     getData();
  //   }
  // }, [gamesStatus, seasonsStatus, dispatch]);

  // useEffect(() => {
  //   // const seasonGames = allGames.filter((g) => g.season === seasonNum);
  //   console.log('games in season:', seasonGames.length);
  // }, [seasonNum, allGames]);


  const handleSeasonChange = (event) => {
    if (event) {
      const newSeason = parseInt(event.target.value, 10);
      if (seasonNum !== newSeason) {
        dispatch(updateSeason(newSeason));
        // setLoading(true);
        // getData(newSeason);
      }
    }
  };

  // show twitch stream on fridays, I guess
  // TODO: integrate with twitch API to get stream status
  //       and show the twitch stream if live
  const showTwitch = new Date().getDay() === 5;
  const vidUrl = showTwitch ? 'https://www.twitch.tv/elffawm' : networkPromo;
  const lightPlayer = !showTwitch;
  const tooltipText = showTwitch ? '' : 'Click to get hyped';
  const streamHeight = showTwitch ? 800 : '';

  // console.log(games);
  const gamesByTime = games.reduce((rv, x) => {
    // eslint-disable-next-line no-param-reassign
    (rv[x.gameTime] = rv[x.gameTime] || []).push(x);
    return rv;
  }, {});

  return (
    <BaseApp>
      <Grid container spacing={2} justify="center">
        <Grid item xs={12}>
          <PageHeader headerText="Welcome to the Rocket League League league site!" />
        </Grid>
        <Grid item xs={12}>
          <SeasonSelector
            season={seasonNum}
            handleSeasonChange={handleSeasonChange}
            forceRefresh={getData}
          />
          <Standings season={seasonNum} />
        </Grid>
        <Grid item xs={12} style={{ width: '100%' }}>
          <Paper className={classes.paper}>
            <Tooltip title={tooltipText}>
              <ReactPlayer url={vidUrl} light={lightPlayer} controls width="" height={streamHeight} />
            </Tooltip>
          </Paper>
        </Grid>
        {/* eslint-disable no-nested-ternary */}
        {gamesStatus === 'loading' ? (
          <span style={{ textAlign: 'center' }}>
            <CircularProgress color="secondary" />
            <Typography>Loading Schedule...</Typography>
            <Button onClick={getData}>Taking forever?</Button>
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
                    fontVariant: 'small-caps', marginLeft: 32, marginTop: 16,
                  }}
                >
                  {`Upcoming games ${games[0].gameTime.split(' ')[0]}`}
                </Typography>
                <Grid container direction="row" alignItems="center" justify="center">
                  <Grid item xs={3}>
                    <Typography variant="h5" className={classes.gameSubtitle} style={{ fontSize: '1.5rem', color: 'initial' }}>
                      {games[0].arena}
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography
                      variant="h5"
                      style={{
                        fontVariant: 'small-caps', fontWeight: 700, marginLeft: 32, marginTop: 16,
                      }}
                    >
                        GONGSHOW 1
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography
                      variant="h5"
                      style={{
                        fontVariant: 'small-caps', fontWeight: 700, marginLeft: 32, marginTop: 16,
                      }}
                    >
                        GONGSHOW 2
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography
                      variant="h5"
                      style={{
                        fontVariant: 'small-caps', fontWeight: 700, marginLeft: 32, marginTop: 16,
                      }}
                    >
                        GONGSHOW 3
                    </Typography>
                  </Grid>
                </Grid>
                <Grid container direction="row" alignItems="center" justify="flex-start">
                  {Object.keys(gamesByTime).map((gameTime) => {
                    const curGames = gamesByTime[gameTime];
                    const game1 = curGames.find((g) => g.streamRoom?.slice(-1) === '1');
                    const game2 = curGames.find((g) => g.streamRoom?.slice(-1) === '2');
                    const game3 = curGames.find((g) => g.streamRoom?.slice(-1) === '3');
                    return (
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
                        <Grid item xs={3}>
                          <Typography variant="h6" className={classes.gameSubtitle} style={{ fontSize: '1.4rem' }}>
                            {`${gameTime.split(' ')[1]} ${gameTime.split(' ')[2]}`}
                          </Typography>
                        </Grid>
                        {game1 ? (
                          <Grid item xs={3}>
                            <Paper
                              className={`${classes.darkerPaper} game-with-division-${game1.curDivision}`}
                              // style={{
                              //   backgroundImage: game1.curDivision === '1' ? `url(${div1})` : `url(${div2})`,
                              //   backgroundPosition: 'left',
                              //   backgroundSize: 'cover',
                              // }}
                            >
                              <GameCardCompact
                                upcomingOverview
                                matchId={game1.matchNum}
                                team1={game1.homeTeam}
                                team2={game1.awayTeam}
                                division={game1.curDivision}
                                isPlayoffs={!!(game1.homeTeamScoreC && game1.awayTeamScoreC)}
                                homeScoreA={game1.homeTeamScoreA}
                                homeScoreB={game1.homeTeamScoreB}
                                homeScoreC={game1.homeTeamScoreC}
                                awayScoreA={game1.awayTeamScoreA}
                                awayScoreB={game1.awayTeamScoreB}
                                awayScoreC={game1.awayTeamScoreC}
                              />
                            </Paper>
                          </Grid>
                        ) : (
                          <Grid item xs={3} />
                        )}
                        {game2 ? (
                          <Grid item xs={3}>
                            <Paper className={`${classes.darkerPaper} game-with-division-${game2.curDivision}`}>
                              <GameCardCompact
                                upcomingOverview
                                matchId={game2.matchNum}
                                team1={game2.homeTeam}
                                team2={game2.awayTeam}
                                division={game2.curDivision}
                                isPlayoffs={!!(game2.homeTeamScoreC && game2.awayTeamScoreC)}
                                homeScoreA={game2.homeTeamScoreA}
                                homeScoreB={game2.homeTeamScoreB}
                                homeScoreC={game2.homeTeamScoreC}
                                awayScoreA={game2.awayTeamScoreA}
                                awayScoreB={game2.awayTeamScoreB}
                                awayScoreC={game2.awayTeamScoreC}
                              />
                            </Paper>
                          </Grid>
                        ) : (
                          <Grid item xs={3} />
                        )}
                        {game3 ? (
                          <Grid item xs={3}>
                            <Paper className={`${classes.darkerPaper} game-with-division-${game3.curDivision}`}>
                              <GameCardCompact
                                upcomingOverview
                                matchId={game3.matchNum}
                                team1={game3.homeTeam}
                                team2={game3.awayTeam}
                                division={game3.curDivision}
                                isPlayoffs={!!(game3.homeTeamScoreC && game3.awayTeamScoreC)}
                                homeScoreA={game3.homeTeamScoreA}
                                homeScoreB={game3.homeTeamScoreB}
                                homeScoreC={game3.homeTeamScoreC}
                                awayScoreA={game3.awayTeamScoreA}
                                awayScoreB={game3.awayTeamScoreB}
                                awayScoreC={game3.awayTeamScoreC}
                              />
                            </Paper>
                          </Grid>
                        ) : (
                          <Grid item xs={3} />
                        )}
                      </>
                    );
                  })}
                </Grid>
              </Paper>
            </Grid>
          )
        )}
      </Grid>
    </BaseApp>
  );
};

export default Dashboard;
