import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Grid, Paper, Typography,
} from '@material-ui/core';
import { createStyles, withStyles } from '@material-ui/core/styles';

import BaseApp from './BaseApp';

import combineStats from '../../images/CombineS2.png';

const styles = withStyles((theme) => createStyles({
  paper: {
    padding: theme.spacing(1),
    textAlign: 'center',
    backgroundColor: theme.palette.primary.main,
    width: '100%',
  },
}));

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
            <Grid item xs={5}>
              <Typography color="secondary" variant="h4">Season 2 Scouting Combine</Typography>
            </Grid>
            <Grid item xs={7}>
              <img alt="stats from season 2 scouting combine" src={combineStats} />
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

export default styles(Stats);
