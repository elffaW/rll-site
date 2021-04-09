import React, { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import ToggleButton from '@material-ui/lab/ToggleButton';

import BaseApp from './BaseApp';
import PageHeader from '../PageHeader';
import PlayerTopTenTable from '../PlayerTopTenTable';
import TeamTopTenTable from '../TeamTopTenTable';
import GameTopTenTable from '../GameTopTenTable';
import GoalsTopTenTable from '../GoalsTopTenTable';
import SeasonSelector from '../SeasonSelector';
import api from '../utils/api';

const CM_TO_MILE = 160934;
const IGNORE_FIELDS = [
  'id',
  'season',
  'team',
  'curDivision',
  'rank',
  'members',
  'gameTime',
  'gameNum',
  'gameName',
  'startTime',
  'gameWeek',
  'matchNum',
  'awayTeamId',
  'awayTeamScore',
  'awayTeamRank',
  'homeTeamId',
  'homeTeamScore',
  'homeTeamRank',
  'timeOfGame',
];

/**
 * mapping used for old format games (S1-S4)
 */
const gameToLetterMap = {
  0: 'A',
  1: 'B',
  2: 'C',
  3: 'D',
  4: 'E',
};

const useStyles = makeStyles((theme) => ({
  recordTable: {
    fontVariant: 'small-caps',
    color: theme.otherColors.text.lighter,
    backgroundColor: theme.palette.primary.darker,
    boxShadow: `1px 1px 2px ${theme.palette.secondary.main}`,
  },
  sectionHeader: {
    textShadow: `2px 1px 2px ${theme.otherColors.text.light}`,
    fontWeight: 500,
  },
  fieldSelector: {
    float: 'right',
    padding: theme.spacing(0.5),
    backgroundColor: theme.otherColors.text.light,
    borderRadius: theme.spacing(0.5),
    margin: theme.spacing(0.5),
  },
}));

export default function RecordBook() {
  const classes = useStyles();

  const [season, setSeason] = useState('All');
  const [showTotals, setShowTotals] = useState(true);

  const [players, setPlayers] = useState([]);
  const [playerField, setPlayerField] = useState('goals');
  const [playerFields, setPlayerFields] = useState([]);

  const [games, setGames] = useState([]);
  const [gameField, setGameField] = useState('');
  const [gameFields, setGameFields] = useState([]);

  const [goals, setGoals] = useState([]);
  const [goalField, setGoalField] = useState('');
  const [goalFields, setGoalFields] = useState([]);

  const [teams, setTeams] = useState([]);
  const [teamField, setTeamField] = useState('');
  const [teamFields, setTeamFields] = useState([]);

  const [loading, setLoading] = useState(true);

  const getData = async () => {
    setLoading(true);
    const playersData = await api.getAllPlayers();
    const teamsData = await api.getAllTeams();
    const gamesData = await api.getAllGames();
    const goalsData = await api.getAllGoals();
    const allPlayers = playersData.map((p) => p.data);
    const allTeams = teamsData.map((t) => t.data);
    const allGames = gamesData.map((g) => g.data);
    const allGoals = goalsData.map((g) => g.data);

    const filteredPlayers = allPlayers.filter((p) => p.gamesPlayed > 0);
    const lastPlayer = filteredPlayers[filteredPlayers.length - 1];
    const playerStatFields = Object.keys(lastPlayer).filter((f) => (
      (typeof lastPlayer[f] === 'number') || !Number.isNaN(parseFloat(lastPlayer[f])))
      && IGNORE_FIELDS.indexOf(f) < 0);
    playerStatFields.push('valueChange');
    playerStatFields.sort((a, b) => a.localeCompare(b));
    let playersWithTeams = filteredPlayers.map((player) => {
      const { ...tempPlayer } = player;
      const playerTeam = allTeams.find((t) => t.season === player.season && t.id === parseInt(player.team, 10));

      tempPlayer.teamName = playerTeam?.name;
      // eslint-disable-next-line
      tempPlayer.teamLogo = require(`../../images/LOGO_${playerTeam?.name.toUpperCase() || 'DINOBOTS'}.png`);

      if (player.value.startsWith('$')) {
        tempPlayer.value = player.value.slice(1);
      }
      if (player.value.endsWith('M')) {
        tempPlayer.value = tempPlayer.value.slice(0, -1);
      }
      if (player.signingValue.startsWith('$')) {
        tempPlayer.signingValue = player.signingValue.slice(1);
      }
      if (player.signingValue.endsWith('M')) {
        tempPlayer.signingValue = tempPlayer.signingValue.slice(0, -1);
      }

      tempPlayer.valueChange = parseFloat(tempPlayer.value) - parseFloat(tempPlayer.signingValue);

      return tempPlayer;
    });

    let teamsWithLogos = allTeams.map((team) => {
      const { ...tempTeam } = team;

      tempTeam.gamesPlayed = parseInt(team.wins, 10) + parseInt(team.losses, 10);
      if (team.value.startsWith('$')) {
        tempTeam.value = team.value.slice(1);
      }
      if (team.value.endsWith('M')) {
        tempTeam.value = tempTeam.value.slice(0, -1);
      }
      tempTeam.value = parseFloat(tempTeam.value);

      // eslint-disable-next-line
      tempTeam.teamLogo = require(`../../images/LOGO_${tempTeam?.name.toUpperCase() || 'DINOBOTS'}.png`);

      return tempTeam;
    });

    let gamesWithTeams = [];
    allGames.forEach((game) => {
      const { ...tempGame } = game;
      const homeTeam = teamsWithLogos.find((t) => t.season === game.season && t.id === parseInt(game.homeTeamId, 10));
      tempGame.homeTeam = homeTeam;
      const awayTeam = teamsWithLogos.find((t) => t.season === game.season && t.id === parseInt(game.awayTeamId, 10));
      tempGame.awayTeam = awayTeam;

      let oldFormat = false;
      if (game.homeTeamScoreA || game.awayTeamScoreA) {
        tempGame.homeTeamScore = parseInt(game.homeTeamScoreA, 10);
        tempGame.awayTeamScore = parseInt(game.awayTeamScoreA, 10);
        oldFormat = true;
      }

      if (parseInt(tempGame.homeTeamScore, 10) > parseInt(tempGame.awayTeamScore, 10)) {
        tempGame.winningTeam = homeTeam;
        tempGame.losingTeam = awayTeam;
        tempGame.winningScore = tempGame.homeTeamScore;
        tempGame.losingScore = tempGame.awayTeamScore;
      } else {
        tempGame.winningTeam = awayTeam;
        tempGame.losingTeam = homeTeam;
        tempGame.winningScore = tempGame.awayTeamScore;
        tempGame.losingScore = tempGame.homeTeamScore;
      }

      tempGame.goals = parseInt(game.homeTeamScore, 10) + parseInt(game.awayTeamScore, 10);
      tempGame.goalDifferential = Math.abs(parseInt(game.homeTeamScore, 10) - parseInt(game.awayTeamScore, 10));

      if (tempGame.homeTeamScore || tempGame.awayTeamScore) {
        gamesWithTeams.push(tempGame);
      }

      if (oldFormat) {
        Object.keys(gameToLetterMap).forEach((k) => {
          if (k !== 0) {
            if (game[`homeTeamScore${gameToLetterMap[k]}`] || game[`awayTeamScore${gameToLetterMap[k]}`]) {
              tempGame.homeTeamScore = parseInt(game[`homeTeamScore${gameToLetterMap[k]}`], 10);
              tempGame.awayTeamScore = parseInt(game[`awayTeamScore${gameToLetterMap[k]}`], 10);

              if (tempGame.homeTeamScore > tempGame.awayTeamScore) {
                tempGame.winningTeam = homeTeam;
                tempGame.losingTeam = awayTeam;
                tempGame.winningScore = tempGame.homeTeamScore;
                tempGame.losingScore = tempGame.awayTeamScore;
              } else {
                tempGame.winningTeam = awayTeam;
                tempGame.losingTeam = homeTeam;
                tempGame.winningScore = tempGame.awayTeamScore;
                tempGame.losingScore = tempGame.homeTeamScore;
              }

              tempGame.goals = tempGame.homeTeamScore + tempGame.awayTeamScore;
              tempGame.goalDifferential = Math.abs(tempGame.homeTeamScore - tempGame.awayTeamScore);

              if (gamesWithTeams.find((g) => g.id === tempGame.id && g.season === tempGame.season) === undefined) {
                gamesWithTeams.push(tempGame);
              }
            }
          }
        });
      }
    });

    let goalsWithTeams = allGoals.map((goal) => {
      const { ...tempGoal } = goal;
      const team = teamsWithLogos.find((t) => t.season === goal.season && t.name === goal.teamName);
      tempGoal.team = team;
      const opponent = teamsWithLogos.find((t) => t.season === goal.season && t.name === goal.oppTeamName);
      tempGoal.opponent = opponent;

      return tempGoal;
    });

    if (season !== 'All') {
      playersWithTeams = playersWithTeams.filter((p) => p.season === season);
      gamesWithTeams = gamesWithTeams.filter((g) => g.season === season);
      goalsWithTeams = goalsWithTeams.filter((g) => g.season === season);
      teamsWithLogos = teamsWithLogos.filter((t) => t.season === season);
    }

    const lastGame = gamesWithTeams[gamesWithTeams.length - 1];
    const gameStatFields = Object.keys(lastGame).filter((f) => (
      (typeof lastGame[f] === 'number') || !Number.isNaN(parseFloat(lastGame[f])))
      && IGNORE_FIELDS.indexOf(f) < 0);
    gameStatFields.sort((a, b) => a.localeCompare(b));

    const lastGoal = goalsWithTeams[goalsWithTeams.length - 1];
    const goalStatFields = Object.keys(lastGoal).filter((f) => (
      (typeof lastGoal[f] === 'number') || !Number.isNaN(parseFloat(lastGoal[f])))
      && IGNORE_FIELDS.indexOf(f) < 0);
    goalStatFields.sort((a, b) => a.localeCompare(b));

    const lastTeam = teamsWithLogos[teamsWithLogos.length - 1];
    const teamStatFields = Object.keys(lastTeam).filter((f) => (
      (typeof lastTeam[f] === 'number') || !Number.isNaN(parseFloat(lastTeam[f])))
      && IGNORE_FIELDS.indexOf(f) < 0);
    teamStatFields.sort((a, b) => a.localeCompare(b));

    setPlayers(playersWithTeams);
    setGames(gamesWithTeams);
    setGoals(goalsWithTeams);
    setTeams(teamsWithLogos);
    setPlayerFields(playerStatFields);
    setPlayerField(playerStatFields[0]);
    setGameFields(gameStatFields);
    setGameField(gameStatFields[0]);
    setGoalFields(goalStatFields);
    setGoalField(goalStatFields[0]);
    setTeamFields(teamStatFields);
    setTeamField(teamStatFields[0]);
    setLoading(false);
  };

  useEffect(() => {
    // data fetch is in its own function so we can make it async
    getData();
  }, [season]);

  if (loading) {
    return (
      <BaseApp>
        <Grid container spacing={5} alignItems="flex-start" justify="center">
          <Grid item xs={12}>
            <PageHeader headerText="Rocket League League league records" />
          </Grid>
          <Grid item xs={12}>
            <CircularProgress color="secondary" />
            <Typography>Loading Records...</Typography>
            <Button onClick={() => getData()}>Taking forever?</Button>
          </Grid>
        </Grid>
      </BaseApp>
    );
  }
  if ((!players || players.length < 1) && (!games || games.length < 1)) {
    return (
      <BaseApp>
        <Grid container spacing={5} alignItems="flex-start" justify="center">
          <Grid item xs={12}>
            <PageHeader headerText="Rocket League League league records" />
          </Grid>
          <Grid item xs={12}>
            <CircularProgress color="secondary" />
            <Typography>No records found...</Typography>
            <Button onClick={() => getData()}>Try again?</Button>
          </Grid>
        </Grid>
      </BaseApp>
    );
  }

  const playerStats = [{
    list: players,
    field: 'goals',
    title: 'Goals in a Season',
  }, {
    list: players,
    field: 'assists',
    title: 'Assists in a Season',
  }, {
    list: players,
    field: 'points',
    title: 'Points in a Season',
  }, {
    list: players.filter((p) => p.timeHighInAir > 0),
    field: 'timeHighInAir',
    title: 'High Air Time',
    unit: 's',
    precision: 1,
  }, {
    list: players.filter((p) => p.numKickoffFirstTouch > 0),
    field: 'numKickoffFirstTouch',
    fieldFriendly: 'First Touch',
    title: 'First Touches',
  }, {
    list: players.filter((p) => p.ballHitForwardDist > 0).map((p) => {
      const { ...temp } = p;
      temp.ballHitForwardDist /= CM_TO_MILE;
      return temp;
    }),
    field: 'ballHitForwardDist',
    fieldFriendly: 'Fwd Hit Dist',
    title: 'Fwd Hit Dist',
    unit: 'mi',
    precision: 2,
  }, {
    list: players.filter((p) => p.numDemosInflicted > 0),
    field: 'numDemosInflicted',
    fieldFriendly: 'Demos',
    title: 'Demos',
  }, {
    list: players.filter((p) => p.numDemosTaken > 0),
    field: 'numDemosTaken',
    fieldFriendly: 'Demos Taken',
    title: 'Demos Taken',
  }, {
    list: players.filter((p) => p.boostUsage > 0),
    field: 'boostUsage',
    fieldFriendly: 'Boost Usage',
    title: 'Boost Usage',
  }, {
    list: players.filter((p) => p.numStolenBoosts > 0),
    field: 'numStolenBoosts',
    fieldFriendly: 'Stolen Boosts',
    title: 'Stolen Boosts',
  }];

  return (
    <BaseApp>
      <Grid container spacing={5} alignItems="flex-start" justify="space-evenly">
        <Grid item xs={12}>
          <PageHeader headerText="Rocket League League league records" />
        </Grid>
        <Grid item xs={12}>
          <SeasonSelector
            season={season}
            handleSeasonChange={(event) => setSeason(event.target.value)}
            forceRefresh={() => getData()}
            showAllOption
          />
          <span>
            <Typography variant="h4" className={classes.sectionHeader}>Records</Typography>
            <ToggleButtonGroup
              id="average-total-toggle-records"
              onChange={(e, newValue) => setShowTotals(newValue === 'total')}
              value={showTotals ? 'total' : 'avg'}
              exclusive
            >
              <ToggleButton key="option-total" value="total">
                Total
              </ToggleButton>
              <ToggleButton key="option-avg" value="avg">
                Avg PG
              </ToggleButton>
            </ToggleButtonGroup>
          </span>
        </Grid>

        {/* DYNAMIC STATS TABLES */}
        <Grid item xs={12} md={6}>
          <Grid container direction="column" alignItems="flex-end">
            <FormControl>
              <InputLabel id="player-stat-select-outlined-label">Stat Field</InputLabel>
              <Select
                labelId="player-stat-select-outlined-label"
                id="player-stat-select-outlined"
                value={playerField}
                onChange={(e) => setPlayerField(e.target.value)}
                label="Stat Field"
              >
                {playerFields.map((field) => (
                  <MenuItem key={`${field}-player-stat-selector`} value={field}>{field}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Paper className={classes.recordTable}>
              <PlayerTopTenTable
                average={!showTotals}
                list={players.filter((p) => !Number.isNaN(p[playerField]) && p[playerField] !== undefined)}
                field={playerField}
                title={`${playerField} [Player Stats]`}
                precision={1}
              />
            </Paper>
          </Grid>
        </Grid>
        <Grid item xs={12} md={6}>
          <Grid container direction="column" alignItems="flex-end">
            <FormControl>
              <InputLabel id="team-stat-select-outlined-label">Stat Field</InputLabel>
              <Select
                labelId="team-stat-select-outlined-label"
                id="team-stat-select-outlined"
                value={teamField}
                onChange={(e) => setTeamField(e.target.value)}
                label="Stat Field"
              >
                {teamFields.map((field) => (
                  <MenuItem key={`${field}-team-stat-selector`} value={field}>{field}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Paper className={classes.recordTable}>
              <TeamTopTenTable
                average={!showTotals}
                list={teams.filter((t) => !Number.isNaN(t[teamField]) && t[teamField] !== undefined)}
                field={teamField}
                title={`${teamField} [Team Stats]`}
                precision={1}
              />
            </Paper>
          </Grid>
        </Grid>
        <Grid item xs={12} md={8}>
          <Grid container direction="column" alignItems="flex-end">
            <FormControl>
              <InputLabel id="game-stat-select-outlined-label">Stat Field</InputLabel>
              <Select
                labelId="game-stat-select-outlined-label"
                id="game-stat-select-outlined"
                value={gameField}
                onChange={(e) => setGameField(e.target.value)}
                label="Stat Field"
              >
                {gameFields.map((field) => (
                  <MenuItem key={`${field}-game-stat-selector`} value={field}>{field}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Paper className={classes.recordTable}>
              <GameTopTenTable
                average={!showTotals}
                list={games.filter((g) => !Number.isNaN(g[gameField]) && g[gameField] !== undefined)}
                field={gameField}
                title={`${gameField} [Game Stats]`}
                precision={1}
              />
            </Paper>
          </Grid>
        </Grid>
        <Grid item xs={12} md={8}>
          <Grid container direction="column" alignItems="flex-end">
            <FormControl>
              <InputLabel id="goal-stat-select-outlined-label">Stat Field</InputLabel>
              <Select
                labelId="goal-stat-select-outlined-label"
                id="goal-stat-select-outlined"
                value={goalField}
                onChange={(e) => setGoalField(e.target.value)}
                label="Stat Field"
              >
                {goalFields.map((field) => (
                  <MenuItem key={`${field}-goal-stat-selector`} value={field}>{field}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Paper className={classes.recordTable}>
              <GoalsTopTenTable
                average={!showTotals}
                list={goals.filter((g) => !Number.isNaN(g[goalField]) && g[goalField] !== undefined)}
                field={goalField}
                title={`${goalField} [Goal Stats]`}
                precision={1}
              />
            </Paper>
          </Grid>
        </Grid>

        {/* PLAYER RECORDS */}
        <Grid item xs={12}>
          <Typography variant="h4" className={classes.sectionHeader}>Player Records</Typography>
          <ToggleButtonGroup
            id="average-total-toggle-records-2"
            onChange={(e, newValue) => setShowTotals(newValue === 'total')}
            value={showTotals ? 'total' : 'avg'}
            exclusive
          >
            <ToggleButton key="option-total" value="total">
              Total
            </ToggleButton>
            <ToggleButton key="option-avg" value="avg">
              Avg
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>
        {playerStats.map((p) => (
          <Grid item xs={12} md={6} xl={4}>
            <Paper className={classes.recordTable}>
              <PlayerTopTenTable
                average={!showTotals}
                list={p.list}
                field={p.field}
                title={p.title}
                unit={p.unit}
                fieldFriendly={p.fieldFriendly}
                precision={p.precision}
              />
            </Paper>
          </Grid>
        ))}

        {/* TEAM RECORDS */}
        <Grid item xs={12}>
          <Typography variant="h4" className={classes.sectionHeader}>Team Records</Typography>
          <ToggleButtonGroup
            id="average-total-toggle-records-3"
            onChange={(e, newValue) => setShowTotals(newValue === 'total')}
            value={showTotals ? 'total' : 'avg'}
            exclusive
          >
            <ToggleButton key="option-total" value="total">
              Total
            </ToggleButton>
            <ToggleButton key="option-avg" value="avg">
              Avg
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>
        <Grid item xs={12} md={6} xl={4}>
          <Paper className={classes.recordTable}>
            <TeamTopTenTable
              average={!showTotals}
              list={teams}
              field="wins"
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} xl={4}>
          <Paper className={classes.recordTable}>
            <TeamTopTenTable
              average={!showTotals}
              list={teams}
              field="value"
              precision={1}
              title="Total Team Value"
              unit="$M"
            />
          </Paper>
        </Grid>

        {/* GAME RECORDS */}
        <Grid item xs={12}>
          <Typography variant="h4" className={classes.sectionHeader}>Game Records</Typography>
          <ToggleButtonGroup
            id="average-total-toggle-records-4"
            onChange={(e, newValue) => setShowTotals(newValue === 'total')}
            value={showTotals ? 'total' : 'avg'}
            exclusive
          >
            <ToggleButton key="option-total" value="total">
              Total
            </ToggleButton>
            <ToggleButton key="option-avg" value="avg">
              Avg
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>
        <Grid item xs={12} md={6} xl={4}>
          <Paper className={classes.recordTable}>
            <GameTopTenTable
              list={games.filter((g) => !Number.isNaN(g.goals))}
              field="goals"
              title="Goals in a Game"
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} xl={4}>
          <Paper className={classes.recordTable}>
            <GameTopTenTable
              list={games.filter((g) => !Number.isNaN(g.goalDifferential))}
              field="goalDifferential"
              title="Goal Differential (Single Game)"
            />
          </Paper>
        </Grid>
      </Grid>
    </BaseApp>
  );
}
