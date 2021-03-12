import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Grid,
  CircularProgress,
  Typography,
  Paper,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useDispatch, useSelector } from 'react-redux';

import BaseApp, { SEASONS } from './BaseApp';
import GameCard from '../GameCard';
import PageHeader from '../PageHeader';
import PlayoffSchedule from '../PlayoffSchedule';
import SeasonSelector from '../SeasonSelector';
import MatchStats from '../MatchStats';
import api from '../utils/api';
import { convertGamesToMatches } from '../utils/dataUtils';
import { stylesHook as paperStyles } from '../../styles/themeStyles';
import { selectCurrentSeason, updateSeason } from '../slices/seasonSlice';
import { fetchGames, selectAllGames, selectGamesBySeason } from '../slices/gameSlice';

const Schedule = (props) => {
  const classes = paperStyles();
  const dispatch = useDispatch();

  const { match } = props;
  const { params } = match;
  const { gameNum } = params;

  // const [games, setGames] = React.useState([]);
  const [expanded, setExpanded] = React.useState(false);

  // TODO: replace these state vars with ones from redux
  // const [loading, setLoading] = React.useState(true);
  const seasonsStatus = useSelector((state) => state.seasons.status);
  const gamesStatus = useSelector((state) => state.games.status);
  const gamesError = useSelector((state) => state.games.error);
  const season = useSelector(selectCurrentSeason);
  // const [seasonNum, setSeasonNum] = React.useState();

  const seasonNum = season ? season.id : null;

  const games = seasonNum
    ? useSelector((state) => selectGamesBySeason(state, seasonNum))
    : useSelector(selectAllGames);

  useEffect(() => {
    if (gamesStatus === 'idle' && seasonsStatus === 'success') {
      dispatch(fetchGames());
    }
  }, [gamesStatus, seasonsStatus, dispatch]);

  // useEffect(() => {
  //   // const seasonGames = allGames.filter((g) => g.season === seasonNum);
  //   console.log('games in season:', seasonGames.length);
  // }, [seasonNum, allGames]);

  const getData = () => {
    dispatch(fetchGames());
  };

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

  const noGamesRet = () => (
    <BaseApp>
      <PageHeader headerText="RLL Schedule" />
      {gamesStatus === 'loading' ? (
        <>
          <CircularProgress color="secondary" />
          <Typography>Loading Schedule...</Typography>
          <Button onClick={getData}>Taking forever?</Button>
        </>
      ) : (
        <>
          <Typography
            variant="h5"
            style={{
              fontVariant: 'small-caps', fontWeight: 700, paddingTop: 16, paddingBottom: 16,
            }}
          >
            {gamesStatus === 'failed' && gamesError ? (
              <>{`ERROR: ${gamesError}`}</>
            ) : (
              <>No games found...</>
            )}
          </Typography>
          <Button onClick={getData}>Try Again?</Button>
          <Typography variant="h5" style={{ fontVariant: 'small-caps' }}>
              Try different season?
          </Typography>
          <SeasonSelector
            season={seasonNum}
            handleSeasonChange={handleSeasonChange}
            forceRefresh={getData}
          />
        </>
      )}
    </BaseApp>
  );

  const handleAccordionExpansion = (accordionIndex) => (event, isExpanded) => {
    setExpanded(isExpanded ? accordionIndex : false);
  };

  if (!season) {
    return (
      <BaseApp>
        <PageHeader headerText="RLL Schedule" />
        <CircularProgress color="secondary" />
        <Typography>Loading...</Typography>
      </BaseApp>
    );
  }

  if (games.length < 1) {
    return noGamesRet();
  }

  const seasonIdx = SEASONS.findIndex((i) => i === seasonNum);
  // unless we're at the current season, there should be a playoff bracket (also S1 was retro-fitted for the site so it's annoying)
  const showPlayoffs = seasonNum !== 1 && seasonIdx < (SEASONS.length - 1) && seasonIdx > -1;

  const gameCards = [];

  if (gameNum) {
    const curGame = games.find((game) => game.id === parseInt(gameNum, 10));
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
      return noGamesRet();
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
        gameCards.push(
          <Grid item xs={12}>
            <Accordion
              className={classes.paper}
              expanded={expanded === i}
              onChange={handleAccordionExpansion(i)}
            >
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

  return (
    <BaseApp>
      <PageHeader headerText="RLL Schedule" />
      { gamesStatus === 'loading' ? (
        <>
          <CircularProgress color="secondary" />
          <Typography>Loading Schedule...</Typography>
          <Button onClick={getData}>Taking forever?</Button>
        </>
      ) : (
        <>
          <SeasonSelector
            season={seasonNum}
            handleSeasonChange={handleSeasonChange}
            forceRefresh={getData}
          />
          {showPlayoffs && <PlayoffSchedule season={seasonNum} />}
          <Grid container spacing={5} alignItems="flex-start" justify="flex-start">
            {gameCards}
          </Grid>
        </>
      )}
    </BaseApp>
  );
};

Schedule.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  match: PropTypes.object.isRequired,
};

export default Schedule;
