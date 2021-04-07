import React, { useEffect, useState } from 'react';
import {
  Grid, Paper, Typography, CircularProgress, Button,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import ToggleButton from '@material-ui/lab/ToggleButton';

import BaseApp from './BaseApp';
import PageHeader from '../PageHeader';
import PlayerTopTenTable from '../PlayerTopTenTable';
import SeasonSelector from '../SeasonSelector';
import api from '../utils/api';

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
}));

const CM_TO_MILE = 160934;

export default function RecordBook() {
  const classes = useStyles();

  const [season, setSeason] = useState('All');
  const [showTotals, setShowTotals] = useState(true);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const getData = async () => {
    setLoading(true);
    const playersData = await api.getAllPlayers();
    const teamsData = await api.getAllTeams();

    const allPlayers = playersData.map((p) => p.data);
    const allTeams = teamsData.map((t) => t.data);
    const filteredPlayers = allPlayers.filter((p) => p.gamesPlayed > 0);
    let playersWithTeams = filteredPlayers.map((player) => {
      const { ...tempPlayer } = player;
      const playerTeam = allTeams.find((t) => t.season === player.season && t.id === parseInt(player.team, 10));

      tempPlayer.teamName = playerTeam?.name;
      // eslint-disable-next-line
      tempPlayer.teamLogo = require(`../../images/LOGO_${playerTeam?.name.toUpperCase() || 'DINOBOTS'}.png`);

      return tempPlayer;
    });

    if (season !== 'All') {
      playersWithTeams = playersWithTeams.filter((p) => p.season === season);
    }

    setPlayers(playersWithTeams);
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
  if (!players || players.length < 1) {
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
            <Typography variant="h4" className={classes.sectionHeader}>Player Records</Typography>
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
                Avg
              </ToggleButton>
            </ToggleButtonGroup>
          </span>
        </Grid>
        <Grid item xs={12} md={6} xl={4}>
          <Paper className={classes.recordTable}>
            <PlayerTopTenTable
              average={!showTotals}
              list={players}
              field="goals"
              title="Goals in a Season"
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} xl={4}>
          <Paper className={classes.recordTable}>
            <PlayerTopTenTable
              average={!showTotals}
              list={players}
              field="assists"
              title="Assists in a Season"
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} xl={4}>
          <Paper className={classes.recordTable}>
            <PlayerTopTenTable
              average={!showTotals}
              list={players}
              field="points"
              title="Points in a Season"
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} xl={4}>
          <Paper className={classes.recordTable}>
            <PlayerTopTenTable
              average={!showTotals}
              list={players.filter((p) => p.timeHighInAir > 0)}
              field="timeHighInAir"
              title="High Air Time"
              unit="s"
              precision={1}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} xl={4}>
          <Paper className={classes.recordTable}>
            <PlayerTopTenTable
              average={!showTotals}
              list={players.filter((p) => p.numKickoffFirstTouch > 0)}
              field="numKickoffFirstTouch"
              fieldFriendly="First Touch"
              title="First Touches"
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} xl={4}>
          <Paper className={classes.recordTable}>
            <PlayerTopTenTable
              average={!showTotals}
              list={players.filter((p) => p.ballHitForwardDist > 0).map((p) => {
                const { ...temp } = p;
                temp.ballHitForwardDist /= CM_TO_MILE;
                return temp;
              })}
              field="ballHitForwardDist"
              fieldFriendly="Fwd Hit Dist"
              title="Fwd Hit Dist"
              unit="mi"
              precision={2}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} xl={4}>
          <Paper className={classes.recordTable}>
            <PlayerTopTenTable
              average={!showTotals}
              list={players.filter((p) => p.numDemosInflicted > 0)}
              field="numDemosInflicted"
              fieldFriendly="Demos"
              title="Demos"
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} xl={4}>
          <Paper className={classes.recordTable}>
            <PlayerTopTenTable
              average={!showTotals}
              list={players.filter((p) => p.numDemosTaken > 0)}
              field="numDemosTaken"
              fieldFriendly="Demos Taken"
              title="Demos Taken"
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} xl={4}>
          <Paper className={classes.recordTable}>
            <PlayerTopTenTable
              average={!showTotals}
              list={players.filter((p) => p.boostUsage > 0)}
              field="boostUsage"
              fieldFriendly="Boost Usage"
              title="Boost Usage"
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} xl={4}>
          <Paper className={classes.recordTable}>
            <PlayerTopTenTable
              average={!showTotals}
              list={players.filter((p) => p.numStolenBoosts > 0)}
              field="numStolenBoosts"
              fieldFriendly="Stolen Boosts"
              title="Stolen Boosts"
            />
          </Paper>
        </Grid>
      </Grid>
    </BaseApp>
  );
}
