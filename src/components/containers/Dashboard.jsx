import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Grid, Paper,
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
    // const vidUrl = '../../videos/NetworkPromo.mp4';
    return (
      <BaseApp>
        <Grid container spacing={2} justify="center">
          <Paper className={classes.paper}>
            <ReactPlayer url={networkPromo} light controls width="" height="" />
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
