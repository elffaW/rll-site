import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Grid, Paper, Typography,
} from '@material-ui/core';

import BaseApp from './BaseApp';
import PageHeader from '../PageHeader';
import { styles as paperStyles } from '../../styles/themeStyles';

const defaultProps = {
  classes: '',
};

// TODO rewrite as function component
class Stats extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  render() {
    const { classes } = this.props;
    return (
      <BaseApp>
        <PageHeader headerText="RLL Stats" />
        <Paper className={classes.paper}>
          <Grid container spacing={2} alignItems="flex-start" justify="flex-start">
            <Grid item xs={12} style={{ height: 'calc(100vh - 200px)' }}>
              <Paper className={classes.statsPaper}>
                <Typography variant="h3" style={{ padding: '8px 0 8px 0', textShadow: '1px 1px 1px black' }}>Season 4 Stats</Typography>
                <iframe
                  title="rll-stats-season-4"
                  height="100%"
                  width="99%"
                  src="https://public.flourish.studio/story/639682/embed"
                >
                  {/* <div class="flourish-embed" data-src="story/639682"><script src="https://public.flourish.studio/resources/embed.js"></script></div> */}
                </iframe>
              </Paper>
            </Grid>
            <Grid item xs={12}><br /></Grid>
            <Grid item xs={12} style={{ height: 'calc(100vh - 200px)' }}>
              <Paper className={classes.statsPaper}>
                <Typography variant="h3" style={{ padding: '8px 0 8px 0', textShadow: '1px 1px 1px black' }}>Season 3 Stats</Typography>
                <iframe
                  title="rll-stats-season-3"
                  height="100%"
                  width="99%"
                  src="https://public.flourish.studio/story/498800/embed"
                >
                  {/* <div class="flourish-embed" data-src="story/498800" data-url="https://flo.uri.sh/story/498800/embed"><script src="https://public.flourish.studio/resources/embed.js"></script></div> */}
                </iframe>
              </Paper>
            </Grid>
            <Grid item xs={12}><br /></Grid>
            <Grid item xs={12} style={{ height: 'calc(100vh - 200px)' }}>
              <Paper className={classes.statsPaper}>
                <Typography variant="h3" style={{ padding: '8px 0 8px 0', textShadow: '1px 1px 1px black' }}>Season 2 Stats</Typography>
                <iframe
                  title="rll-stats-season-2"
                  height="100%"
                  width="99%"
                  src="https://public.flourish.studio/story/382668/embed"
                >
                  {/* <div className="flourish-embed" data-src="story/382668" data-url="https://flo.uri.sh/story/382668/embed"><script src="https://public.flourish.studio/resources/embed.js" /></div> */}
                </iframe>
              </Paper>
            </Grid>
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
  }
}

Stats.propTypes = {
  classes: PropTypes.string,
};
Stats.defaultProps = defaultProps;

export default paperStyles(Stats);
