import React from 'react';
import PropTypes from 'prop-types';
import {
  Typography, Select, MenuItem, IconButton,
} from '@material-ui/core';
import SyncIcon from '@material-ui/icons/Sync';
import { makeStyles } from '@material-ui/core/styles';
import { SEASONS } from './containers/BaseApp';

const useStyles = makeStyles(() => ({
  seasonText: {
    fontVariant: 'small-caps',
    fontWeight: 700,
  },
  seasonSelector: {
    fontSize: '2rem',
    marginLeft: 12,
    marginTop: -6.5,
  },
}));

export default function SeasonSelector(props) {
  const {
    season, handleSeasonChange, forceRefresh, disabled, showAllOption,
  } = props;
  const classes = useStyles();
  return (
    <Typography
      variant="h5"
      className={classes.seasonText}
    >
      Season
      <Select
        labelId="season-select-outlined-label"
        id="season-select-outlined"
        value={season}
        onChange={handleSeasonChange}
        className={classes.seasonSelector}
        disabled={disabled}
      >
        {showAllOption ? (
          <MenuItem value="All">All</MenuItem>
        ) : null}
        {SEASONS.map((s) => (
          <MenuItem value={s}>{s}</MenuItem>
        ))}
      </Select>
      <IconButton aria-label="reload" onClick={forceRefresh}>
        <SyncIcon />
      </IconButton>
    </Typography>
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
