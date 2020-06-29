import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Grid, CircularProgress, Typography, Button, Paper,
} from '@material-ui/core';

import GameCardCompact from './GameCardCompact';
import api from './utils/api';
import { styles as paperStyles } from '../styles/themeStyles';

const defaultProps = {
  classes: '',
};

class PlayoffSchedule extends Component {
  constructor(props) {
    super(props);

    this.state = {
      teamsByRank: [], // teamsData.sort((a, b) => b.points - a.points), // sort with higher points at top
      loading: true,
    };
  }

  componentDidMount() {
    // update data?
    this.getData();
  }

  getData = () => {
    api.getAllTeams().then((allTeams) => {
      const teams = allTeams.map((team) => team.data);
      teams.sort((a, b) => a.rank - b.rank); // sort with lower rank at top

      // disable these lint issues: import/no-dynamic-require global-require
      // eslint-disable-next-line
      teams.forEach((team) => team.logo = require(`../images/LOGO_${team.name}.png`));

      const teamsByRank = {};
      teams.forEach((team) => {
        teamsByRank[team.rank] = team;
      });

      this.setState({ teamsByRank, loading: false });
    });
  }

  render() {
    const { classes } = this.props;
    const { teamsByRank, loading } = this.state;

    const team1 = teamsByRank[1];
    const team2 = teamsByRank[2];
    const team3 = teamsByRank[3];
    const team4 = teamsByRank[4];
    const team5 = teamsByRank[5];
    const team6 = teamsByRank[6];
    const team7 = teamsByRank[7];
    const team8 = teamsByRank[8];

    const teamUnknown = {
      name: 'TBD',
      rank: '?',
      wins: '',
      losses: '',
      logo: require(`../images/RLL_logo.png`), // eslint-disable-line
    };

    const q1Date = 'Time & Date TBD'; // '6/26/2020 7:30 PM -0500';
    const s1Date = 'Time & Date TBD'; // '6/26/2020 8:50 PM -0500';
    const q2Date = 'Time & Date TBD'; // '6/26/2020 7:50 PM -0500';
    const finalDate = 'Time & Date TBD'; // '6/26/2020 9:30 PM -0500';
    const q3Date = 'Time & Date TBD'; // '6/26/2020 8:10 PM -0500';
    const s2Date = 'Time & Date TBD'; // '6/26/2020 9:10 PM -0500';
    const q4Date = 'Time & Date TBD'; // '6/26/2020 8:30 PM -0500';

    const playoffArena = 'Champions Field';

    return (
      <>
        {/* <PageHeader headerText="RLL Season 2 Playoff Schedule" /> */}
        { loading ? (
          <>
            <CircularProgress color="secondary" />
            <Typography>Loading Playoff Schedule...</Typography>
            <Button onClick={this.getData}>Taking forever?</Button>
          </>
        ) : (
          <Grid container spacing={2} alignItems="flex-start" justify="flex-start">
            <Paper className={classes.paper}>
              <Grid item xs={12}>
                <Grid container alignItems="center" justify="flex-start" style={{ fontVariant: 'small-caps' }}>
                  <Grid item xs={4}>
                    <Typography variant="h6">Quarterfinals</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="h6">Semifinals</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="h6">Finals</Typography>
                  </Grid>
                </Grid>
              </Grid>
              {/* QUARTERFINAL 1 */}
              <Grid item xs={12}>
                <Grid container justify="flex-start">
                  <Grid item xs={5}>
                    <Paper className={classes.darkPaper}>
                      <GameCardCompact
                        team1={team1}
                        team2={team8}
                        time={q1Date}
                        arena={playoffArena}
                        isPlayoffs
                      />
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
              {/* SEMIFINAL 1 */}
              <Grid item xs={12}>
                <Grid container justify="center">
                  <Grid item xs={5}>
                    <Paper className={classes.darkPaper}>
                      <GameCardCompact
                        team1={teamUnknown}
                        team2={teamUnknown}
                        time={s1Date}
                        arena={playoffArena}
                        isPlayoffs
                      />
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
              {/* QUARTERFINAL 2 */}
              <Grid item xs={12}>
                <Grid container justify="flex-start">
                  <Grid item xs={5}>
                    <Paper className={classes.darkPaper}>
                      <GameCardCompact
                        team1={team4}
                        team2={team5}
                        time={q2Date}
                        arena={playoffArena}
                        isPlayoffs
                      />
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
              {/* FINAL */}
              <Grid item xs={12}>
                <Grid container justify="flex-end">
                  <Grid item xs={5}>
                    <Paper className={classes.darkPaper}>
                      <GameCardCompact
                        team1={teamUnknown}
                        team2={teamUnknown}
                        time={finalDate}
                        arena={playoffArena}
                        isPlayoffs
                      />
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
              {/* QUARTERFINAL 3 */}
              <Grid item xs={12}>
                <Grid container justify="flex-start">
                  <Grid item xs={5}>
                    <Paper className={classes.darkPaper}>
                      <GameCardCompact
                        team1={team2}
                        team2={team7}
                        time={q3Date}
                        arena={playoffArena}
                        isPlayoffs
                      />
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
              {/* SEMIFINAL 2 */}
              <Grid item xs={12}>
                <Grid container justify="center">
                  <Grid item xs={5}>
                    <Paper className={classes.darkPaper}>
                      <GameCardCompact
                        team1={teamUnknown}
                        team2={teamUnknown}
                        time={s2Date}
                        arena={playoffArena}
                        isPlayoffs
                      />
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
              {/* QUARTERFINAL 4 */}
              <Grid item xs={12}>
                <Grid container justify="flex-start">
                  <Grid item xs={5}>
                    <Paper className={classes.darkPaper}>
                      <GameCardCompact
                        team1={team3}
                        team2={team6}
                        time={q4Date}
                        arena={playoffArena}
                        isPlayoffs
                      />
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}
      </>
    );
  }
}

PlayoffSchedule.propTypes = {
  // eslint-disable-next-line react/no-unused-prop-types
  classes: PropTypes.string,
};
PlayoffSchedule.defaultProps = defaultProps;

export default paperStyles(PlayoffSchedule);
