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
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import BaseApp, { SEASONS } from './BaseApp';
import GameCard from '../GameCard';
import PageHeader from '../PageHeader';
import PlayoffSchedule from '../PlayoffSchedule';
import SeasonSelector from '../SeasonSelector';
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
    };
  }

  componentDidMount() {
    // get page data
    this.getData();
  }

  getData = (newSeason) => {
    const { season } = this.state;
    const seasonQuery = newSeason || season;

    Promise.all([api.getGamesBySeason(seasonQuery), api.getTeamsBySeason(seasonQuery)]).then((results) => {
      const allGames = results[0];
      const teamsData = results[1];
      const gamesTemp = allGames.map((game) => game.data);
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
        return tempGame;
      });

      // console.log(gamesWithTeams);

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

  render() {
    const { classes, match } = this.props;
    const { games, loading, season } = this.state;
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
      if (curGame) {
        gameCards.push(
          <Grid item xs={12}>
            <Paper className={classes.paper}>
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
      while (i < maxWeeks && !noMoreGames) {
        const curWeekGames = games.filter((game) => parseInt(game.gameWeek, 10) === i); // eslint-disable-line
        if (curWeekGames.length < 1) {
          noMoreGames = true;
        } else {
          gameCards.push(
            <Grid item xs={12}>
              <Accordion className={classes.paper}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`gameweek-${i}-content`}
                  id={`gameweek-${i}-header`}
                >
                  <Typography
                    variant="h4"
                    style={{
                      fontVariant: 'small-caps', fontWeight: 700, paddingTop: 16, paddingBottom: 16,
                    }}
                  >
                    {`GameWeek ${i}`}
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
    /*
      {games.map((game) => (
        <GameCard game={game} />
      ))}
    */
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
};
Schedule.defaultProps = defaultProps;

export default paperStyles(Schedule);
