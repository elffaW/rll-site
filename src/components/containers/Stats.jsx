import React, { useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import BaseApp from './BaseApp';
import PageHeader from '../PageHeader';
import { stylesHook as paperStyles } from '../../styles/themeStyles';
import PlayerGameStats from '../PlayerGameStats';
import PlayerGoalStats from '../PlayerGoalStats';

const flourishCharts = [
  { id: 808378, season: 6 },
  { id: 725885, season: 5 },
  { id: 639682, season: 4 },
  { id: 498800, season: 3 },
  { id: 382668, season: 2 },
];

const Stats = () => {
  const classes = paperStyles();
  const [expanded, setExpanded] = useState(flourishCharts[0].season);

  const handleAccordionExpansion = (accordionIndex) => (event, isExpanded) => {
    setExpanded(isExpanded ? accordionIndex : false);
  };

  return (
    <BaseApp>
      <PageHeader headerText="RLL Stats" />
      <Paper className={classes.statsPaper}>
        <Grid container spacing={2} alignItems="flex-start" justify="flex-start">
          <Grid item xs={12}>
            <Typography variant="h3" style={{ padding: '8px 0 8px 0', textShadow: '1px 1px 1px black' }}>Player Stats</Typography>
            <PlayerGameStats player={-1} playerName="ALL_PLAYERS" season={-1} />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h3" style={{ padding: '8px 0 8px 0', textShadow: '1px 1px 1px black' }}>Goal Stats</Typography>
            <PlayerGoalStats season={-1} />
          </Grid>
          {flourishCharts.map((chart) => (
            <Grid item xs={12}>
              <Accordion
                className={classes.paper}
                expanded={expanded === chart.season}
                onChange={handleAccordionExpansion(chart.season)}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`season-${chart.season}-stats-content`}
                  id={`season-${chart.season}-stats-header`}
                >
                  <Typography variant="h3" style={{ padding: '8px 0 8px 0', textShadow: '1px 1px 1px black' }}>
                    {`Season ${chart.season} Stats`}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container alignItems="center" justify="space-around">
                    <Grid item xs={12} style={{ height: 'calc(100vh - 200px)' }}>
                      <Paper className={classes.statsPaper}>
                        <iframe
                          title={`rll-stats-season-${chart.season}`}
                          height="100%"
                          width="99%"
                          src={`https://public.flourish.studio/story/${chart.id}/embed`}
                        >
                          {/* <div class="flourish-embed" data-src="story/808378"><script src="https://public.flourish.studio/resources/embed.js"></script></div> */}
                        </iframe>
                      </Paper>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>
          ))}
          <Grid item xs={12}><br /></Grid>
          <Grid item xs={12} style={{ height: 800 }}>
            <Paper className={classes.statsPaper}>
              <Typography variant="h3" style={{ padding: '8px 0 8px 0', textShadow: '1px 1px 1px black' }}>Season 1 Stats</Typography>
              <iframe
                title="rll-stats-season-1"
                height="100%"
                width="99%"
                src="https://public.flourish.studio/visualisation/2278186/embed"
              >
                {/* <div className="flourish-embed flourish-hierarchy" data-src="https://public.flourish.studio/visualisation/2278186/embed" data-url="https://flo.uri.sh/visualisation/2278186/embed" /> */}
              </iframe>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </BaseApp>
  );
};

export default Stats;
