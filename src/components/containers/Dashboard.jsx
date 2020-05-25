import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Grid, Paper, Typography, Tooltip,
} from '@material-ui/core';
import ReactPlayer from 'react-player';

import BaseApp from './BaseApp';
import { styles as paperStyles } from '../../styles/themeStyles';

import networkPromo from '../../videos/NetworkPromo.mp4';

const defaultProps = {
  classes: '',
};

class Dashboard extends Component {
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
    // show twitch stream on fridays, I guess
    // TODO: integrate with twitch API to get stream status
    //       and show the twitch stream if live
    const showTwitch = new Date().getDay() === 5;
    const vidUrl = showTwitch ? 'https://www.twitch.tv/elffawm' : networkPromo;
    const lightPlayer = !showTwitch;
    const tooltipText = showTwitch ? '' : 'Click to get hyped';
    const streamHeight = showTwitch ? 800 : '';
    return (
      <BaseApp>
        <Grid container spacing={2} justify="center">
          <Typography variant="h3" style={{ fontVariant: 'small-caps' }}>
            Welcome to the Rocket League League league site!
          </Typography>
          <Paper className={classes.paper}>
            <Tooltip title={tooltipText}>
              <ReactPlayer url={vidUrl} light={lightPlayer} controls width="" height={streamHeight} />
            </Tooltip>
          </Paper>
        </Grid>
      </BaseApp>
    );
  }
}

Dashboard.propTypes = {
  classes: PropTypes.string,
};
Dashboard.defaultProps = defaultProps;

export default paperStyles(Dashboard);
