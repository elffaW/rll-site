import React from 'react';
import PropTypes from 'prop-types';
import {
  Typography, Select, MenuItem, IconButton, Grid, Button,
} from '@material-ui/core';
import Pagination from '@material-ui/lab/Pagination';
import SyncIcon from '@material-ui/icons/Sync';
import { makeStyles } from '@material-ui/core/styles';
import { SEASONS } from './containers/BaseApp';

const useStyles = makeStyles((theme) => ({
  seasonText: {
    fontVariant: 'small-caps',
    fontWeight: 700,
    marginLeft: 48,
  },
  seasonSelector: {
    fontSize: '2rem',
    marginLeft: 12,
    marginTop: -6.5,
  },
  seasonPager: {
    marginBottom: theme.spacing(2),
  },
}));

export default function SeasonSelector(props) {
  const {
    season, handleSeasonChange, forceRefresh, disabled, showAllOption,
  } = props;
  const classes = useStyles();

  const changeSeason = (newVal) => {
    const temp = { target: { value: newVal } };
    handleSeasonChange(temp);
  };

  return (
    <Grid container direction="column" alignItems="center" justify="center">
      <Typography
        variant="h5"
        className={classes.seasonText}
      >
        Season
        <IconButton aria-label="reload" onClick={forceRefresh}>
          <SyncIcon />
        </IconButton>
      </Typography>
      {showAllOption && (
        <Button variant={season === 'All' ? 'contained' : ''} color={season === 'All' ? 'secondary' : 'default'} aria-label="show-all" onClick={() => changeSeason('All')}>
          All
        </Button>
      )}
      <Pagination
        id="season-selector"
        count={SEASONS.length}
        page={season}
        color="secondary"
        onChange={(e, val) => changeSeason(val)}
        hideNextButton
        hidePrevButton
        disabled={disabled}
        className={classes.seasonPager}
      />
    </Grid>
  );
}

SeasonSelector.propTypes = {
  season: PropTypes.number.isRequired,
  handleSeasonChange: PropTypes.func.isRequired,
  forceRefresh: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  showAllOption: PropTypes.bool,
};

SeasonSelector.defaultProps = {
  disabled: false,
  showAllOption: false,
};
