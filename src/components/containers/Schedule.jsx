import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Grid,
  CircularProgress,
  Typography,
  Paper,
  Button,
  MenuItem,
  Select,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@material-ui/core';
import { withTheme } from '@material-ui/core/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import BaseApp, { SEASONS } from './BaseApp';
import GameCard from '../GameCard';
import PageHeader from '../PageHeader';
import PlayoffSchedule from '../PlayoffSchedule';
import SeasonSelector from '../SeasonSelector';
import MatchStats from '../MatchStats';
import api from '../utils/api';
import { convertGamesToMatches } from '../utils/dataUtils';
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
      season: SEASONS[SEASONS.length - 1], // default to the last season in the list
      expanded: false,
    };
  }

  componentDidMount() {
    // get page data
    this.getData();
  }

  getData = (newSeason) => {
    const { season } = this.state;
    const seasonQuery = newSeason || season;

    Promise.all([
      api.getGamesBySeason(seasonQuery),
      api.getTeamsBySeason(seasonQuery),
      api.getStatsBySeason(seasonQuery),
      api.getBallSpeedsBySeason(seasonQuery),
    ]).then((results) => {
      const allGames = results[0];
      const teamsData = results[1];
      const statsData = results[2];
      const ballSpeedData = results[3];
      const seasonAvgBallSpeed = ballSpeedData && ballSpeedData.length > 0
        ? ballSpeedData.reduce((accum, cur) => accum + cur) / ballSpeedData.length
        : -1;
      const stats = statsData.map((stat) => stat.data);
      const gamesData = allGames.map((game) => game.data);
      // associate game stats records with the games
      const gamesTemp = gamesData.map((game) => {
        const { ...tempGame } = game;
        const isOldGameFormat = !game.gameNum;
        let numGames = 0;
        if (isOldGameFormat) {
          if (game.homeTeamScoreA && game.awayTeamScoreA) {
            numGames += 1;
          }
          if (game.homeTeamScoreB && game.awayTeamScoreB) {
            numGames += 1;
          }
          if (game.homeTeamScoreC && game.awayTeamScoreC) {
            numGames += 1;
          }
          if (game.homeTeamScoreD && game.awayTeamScoreD) {
            numGames += 1;
          }
          if (game.homeTeamScoreE && game.awayTeamScoreE) {
            numGames += 1;
          }
        }
        if (numGames > 0) {
          tempGame.numGames = numGames;
        }
        const gameId = game.gameNum ? parseInt(game.gameNum, 10) : ((game.id - 1) * numGames) + 1;
        tempGame.playerStats = stats.filter((stat) => (
          !isOldGameFormat
            ? parseInt(stat.gameId, 10) === gameId
            : parseInt(stat.gameId, 10) >= gameId && parseInt(stat.gameId, 10) < (gameId + numGames)
        ));
        return tempGame;
      });
      // convert games to matches if needed
      const games = convertGamesToMatches(gamesTemp);
      games.sort((a, b) => new Date(a.gameTime) - new Date(b.gameTime)); // earlier game times first
      games.sort((a, b) => (a.id - b.id)); // sort by game ID

      const allTeams = teamsData.map((team) => team.data);
      const gamesWithTeams = games.map((game) => {
        const { ...tempGame } = game;
        tempGame.homeTeam = allTeams.find((team) => (
          parseInt(team.id, 10) === parseInt(tempGame.homeTeamId, 10) && team.season === tempGame.season));
        tempGame.awayTeam = allTeams.find((team) => (
          parseInt(team.id, 10) === parseInt(tempGame.awayTeamId, 10) && team.season === tempGame.season));

        if (!tempGame.homeTeam) {
          tempGame.homeTeam = { rank: game.homeTeamRank };
        }
        if (!tempGame.awayTeam) {
          tempGame.awayTeam = { rank: game.awayTeamRank };
        }

        tempGame.seasonStats = {
          avgBallSpeed: seasonAvgBallSpeed,
        };
        return tempGame;
      });

      this.setState({ games: gamesWithTeams, loading: false });
    }).catch((err) => {
      console.error('Could not get data for page', err);
      this.setState({ loading: false });
    });
  }

  handleSeasonChange = (event) => {
    const { season } = this.state;
    const newSeason = parseInt(event.target.value, 10);
    if (season !== newSeason) {
      this.setState({ season: newSeason, loading: true });
      this.getData(newSeason);
    }
  }

  refreshData = () => {
    this.getData();
  }

  noGamesRet = () => {
    const { loading, season } = this.state;
    return (
      <BaseApp>
        <PageHeader headerText="RLL Schedule" />
        { loading ? (
          <>
            <CircularProgress color="secondary" />
            <Typography>Loading Schedule...</Typography>
            <Button onClick={this.getData}>Taking forever?</Button>
          </>
        ) : (
          <>
            <Typography
              variant="h5"
              style={{
                fontVariant: 'small-caps', fontWeight: 700, paddingTop: 16, paddingBottom: 16,
              }}
            >
              No games found...
            </Typography>
            <Button onClick={this.getData}>Try Again?</Button>
            <Typography variant="h5" style={{ fontVariant: 'small-caps' }}>
              Try different season?
            </Typography>
            <Select
              labelId="season-select-outlined-label"
              id="season-select-outlined"
              value={season}
              onChange={this.handleSeasonChange}
              style={{
                fontSize: '2rem', marginLeft: 12, marginTop: -6.5,
              }}
            >
              {SEASONS.map((s) => (
                <MenuItem value={s}>{s}</MenuItem>
              ))}
            </Select>
          </>
        )}
      </BaseApp>
    );
  }

  handleAccordionExpansion = (accordionIndex) => (event, isExpanded) => {
    this.setState({ expanded: isExpanded ? accordionIndex : false });
  }

  render() {
    const { classes, match, theme } = this.props;
    const {
      games, loading, season, expanded,
    } = this.state;
    const { params } = match;
    const { gameNum } = params;

    if (games.length < 1) {
      return this.noGamesRet();
    }

    const seasonIdx = SEASONS.findIndex((i) => i === season);
    // unless we're at the current season, there should be a playoff bracket (also S1 was retro-fitted for the site so it's annoying)
    const showPlayoffs = season !== 1 && seasonIdx < (SEASONS.length - 1) && seasonIdx > -1;

    const gameCards = [];

    if (gameNum) {
      const curGame = games.find((game) => game.id === parseInt(gameNum, 10));
      console.log(curGame);
      if (curGame) {
        gameCards.push(
          <Grid item xs={12}>
            <Paper className={classes.darkestPaper}>
              <Grid container alignItems="center" justify="space-around">
                <GameCard game={curGame} showDetails />
                <MatchStats match={curGame} />
              </Grid>
            </Paper>
          </Grid>,
        );
      } else {
        return this.noGamesRet();
      }
    } else {
      const maxWeeks = 6;
      let i = 1;
      let noMoreGames = false;
      while (i <= maxWeeks && !noMoreGames) {
        const curWeekGames = games.filter((game) => parseInt(game.gameWeek, 10) === i); // eslint-disable-line
        if (curWeekGames.length < 1) {
          noMoreGames = true;
        } else {
          const curStadium = curWeekGames[0].arena;
          const curDate = curWeekGames[0].gameTime.split(' ')[0];
          gameCards.push(
            <Grid item xs={12}>
              <Accordion
                className={classes.paper}
                expanded={expanded === i}
                onChange={this.handleAccordionExpansion(i)}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`gameweek-${i}-content`}
                  id={`gameweek-${i}-header`}
                >
                  <Typography
                    variant="h4"
                    style={{
                      fontVariant: 'small-caps',
                      fontWeight: 700,
                      paddingTop: theme.spacing(2),
                      paddingBottom: theme.spacing(2),
                    }}
                  >
                    {`GameWeek ${i}`}
                  </Typography>
                  <Typography
                    variant="h4"
                    style={{
                      fontVariant: 'small-caps',
                      paddingTop: theme.spacing(2),
                      paddingBottom: theme.spacing(2),
                      fontWeight: 300,
                      position: 'absolute',
                      right: theme.spacing(10),
                    }}
                  >
                    {curStadium}
                  </Typography>
                  <Typography
                    variant="h4"
                    style={{
                      fontVariant: 'small-caps', paddingTop: 16, paddingBottom: 16, fontWeight: 300, paddingLeft: 24,
                    }}
                  >
                    {curDate}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container alignItems="center" justify="space-around">
                    {curWeekGames.map((game) => (
                      <GameCard game={game} />
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>,
          );
        }
        i++; // eslint-disable-line
      }
    }

    return (
      <BaseApp>
        <PageHeader headerText="RLL Schedule" />
        { loading ? (
          <>
            <CircularProgress color="secondary" />
            <Typography>Loading Schedule...</Typography>
            <Button onClick={this.getData}>Taking forever?</Button>
          </>
        ) : (
          <>
            <SeasonSelector
              season={season}
              handleSeasonChange={this.handleSeasonChange}
              forceRefresh={this.refreshData}
            />
            {showPlayoffs && <PlayoffSchedule season={season} />}
            <Grid container spacing={5} alignItems="flex-start" justify="flex-start">
              {gameCards}
            </Grid>
          </>
        )}
      </BaseApp>
    );
  }
}

Schedule.propTypes = {
  classes: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  match: PropTypes.object.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  theme: PropTypes.object.isRequired,
};
Schedule.defaultProps = defaultProps;

export default withTheme(paperStyles(Schedule));
