import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Grid, Paper, Typography,
} from '@material-ui/core';

import BaseApp from './BaseApp';
import { styles as paperStyles } from '../../styles/themeStyles';
import combineStats from '../../images/CombineS2.png';

const defaultProps = {
  classes: '',
};

class Stats extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  componentDidMount() {
    // get all data for this page
  }

  render() {
    const { classes } = this.props;
    return (
      <BaseApp>
        <Paper className={classes.paper}>
          <Grid container spacing={2} alignItems="flex-start" justify="flex-start">
            <Grid item xs={12} style={{ height: 800 }}>
              <Typography variant="h3">Season 2 Stats</Typography>
              <iframe
                title="rll-stats-season-2"
                height="100%"
                width="100%"
                src="https://public.flourish.studio/story/382668/embed"
              >
                {/* <div className="flourish-embed" data-src="story/382668" data-url="https://flo.uri.sh/story/382668/embed"><script src="https://public.flourish.studio/resources/embed.js" /></div> */}
              </iframe>
            </Grid>
            <Grid item xs={12}><br /></Grid>
            <Grid item xs={12} style={{ height: 800 }}>
              <Typography variant="h3">Season 1 Stats</Typography>
              <iframe
                title="rll-stats-season-1"
                height="100%"
                width="100%"
                src="https://public.flourish.studio/visualisation/2278186/embed"
              >
                {/* <div className="flourish-embed flourish-hierarchy" data-src="https://public.flourish.studio/visualisation/2278186/embed" data-url="https://flo.uri.sh/visualisation/2278186/embed" /> */}
              </iframe>
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
