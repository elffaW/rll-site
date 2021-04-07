import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  Grid, Typography, Avatar, Divider, Tooltip, Button,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  seasonNum: {
    fontSize: '1rem',
  },
  tableTitle: {
    textShadow: `2px 2px 1px ${theme.palette.primary.dark}`,
  },
  tableHeader: {
    fontWeight: 700,
  },
  leftPad: {
    paddingLeft: theme.spacing(1),
  },
  teamLogo: {
    float: 'right',
    paddingRight: theme.spacing(1),
    width: '75%',
    height: '75%',
  },
  elemName: {
    float: 'left',
    color: theme.otherColors.text.lighter,
  },
  mostLeastToggle: {
    marginRight: theme.spacing(1),
    boxShadow: 'none',
    border: `1px solid ${theme.palette.primary.darker}`,
  },
}));

const PlayerTopTenTable = (props) => {
  const classes = useStyles();
  const {
    list, field, title, unit, fieldFriendly, precision, average,
  } = props;

  const [topTen, setTopTen] = useState([]);
  const [sortByMost, setSortByMost] = useState(true);

  const tableTitle = (title && title !== '') ? title : field;

  useEffect(() => {
    let newTopTen = [];
    if (list && list.length < 1) {
      newTopTen = [];
    } else if (list.length === 1) {
      newTopTen = list;
    // eslint-disable-next-line no-prototype-builtins
    } else if (list[0].hasOwnProperty(field)) {
      switch (typeof list[0][field]) {
        case 'string':
          if (sortByMost) {
            newTopTen = list.sort((a, b) => a[field].localeCompare(b[field])).slice(0, 10);
          } else {
            newTopTen = list.sort((a, b) => b[field].localeCompare(a[field])).slice(0, 10);
          }
          break;
        case 'number':
        default:
          if (average) {
            if (sortByMost) {
              newTopTen = list.sort((a, b) => (
                (parseFloat(b[field] || 0) / (b.gamesPlayed || 1)) - (parseFloat(a[field] || 0) / (a.gamesPlayed || 1))
              )).slice(0, 10);
            } else {
              newTopTen = list.sort((a, b) => (
                (parseFloat(a[field] || 0) / (a.gamesPlayed || 1)) - (parseFloat(b[field] || 0) / (b.gamesPlayed || 1))
              )).slice(0, 10);
            }
          } else if (sortByMost) {
            newTopTen = list.sort((a, b) => parseFloat(b[field]) - parseFloat(a[field])).slice(0, 10);
          } else {
            newTopTen = list.sort((a, b) => parseFloat(a[field]) - parseFloat(b[field])).slice(0, 10);
          }
          break;
      }
    } else {
      newTopTen = list && list.length > 0 ? list.slice(0, 10) : [];
    }

    setTopTen(newTopTen);
  }, [sortByMost, average]);

  if (list.length < 1 || topTen.length < 1) {
    return '';
  }

  let fieldLabel = fieldFriendly && fieldFriendly !== '' ? fieldFriendly : field;
  if (average) {
    fieldLabel += ' PG';
  }

  return (
    <Grid container alignItems="flex-start" justify="flex-start">
      <Grid item xs={12}>
        <Grid container direction="row">
          <Button
            variant="contained"
            color="primary"
            className={classes.mostLeastToggle}
            onClick={() => setSortByMost(!sortByMost)}
          >
            {sortByMost ? 'Most' : 'Least'}
          </Button>
          <Typography variant="h5" className={classes.tableTitle}>{tableTitle}</Typography>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Divider />
      </Grid>
      <Grid item xs={12}>
        <Grid container direction="row" spacing={1} alignItems="flex-start" justify="flex-start">
          <Grid item xs={1}>
            <Typography className={`${classes.tableHeader} ${classes.leftPad}`}>Rank</Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography className={classes.tableHeader}>Season</Typography>
          </Grid>
          <Grid item xs={1}>
            <Typography className={`${classes.tableHeader} ${classes.elemName}`}>Tm</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography className={`${classes.tableHeader} ${classes.elemName}`}>Name</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography className={classes.tableHeader}>{unit && unit !== '' ? `${fieldLabel} (${unit})` : fieldLabel}</Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Divider />
      </Grid>
      {topTen.map((elem, idx) => (
        <Grid item xs={12}>
          <Grid container direction="row" spacing={1} alignItems="flex-end" justify="flex-start">
            <Grid item xs={1}>
              <Typography>{idx + 1}</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography variant="h4" className={`${classes.seasonNum} player-mini-season-${elem.season}`}>
                <span className={`player-season-mini-inside-${elem.season}`}>
                  {elem.season}
                </span>
              </Typography>
            </Grid>
            <Grid item xs>
              <Tooltip title={elem.teamName}>
                <Link exact to={`/teams/${elem.teamName.toUpperCase()}`}>
                  <Avatar src={elem.teamLogo} variant="square" className={classes.teamLogo} alt={elem.teamName} />
                </Link>
              </Tooltip>
            </Grid>
            <Grid item xs={4}>
              <Link exact to={`/players/${elem.name}`}>
                <Typography className={classes.elemName}>{elem.name}</Typography>
              </Link>
            </Grid>
            <Grid item xs={4}>
              <Typography>
                {average
                  ? ((elem[field] || 0) / (elem.gamesPlayed || 1))?.toFixed(precision + +average)
                  : elem[field]?.toFixed(precision)}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      ))}
    </Grid>
  );
};

PlayerTopTenTable.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  list: PropTypes.array.isRequired,
  field: PropTypes.string.isRequired,
  fieldFriendly: PropTypes.string,
  title: PropTypes.string,
  unit: PropTypes.string,
  precision: PropTypes.number,
  average: PropTypes.bool,
};
PlayerTopTenTable.defaultProps = {
  fieldFriendly: '',
  title: '',
  unit: '',
  precision: 0,
  average: false,
};

export default PlayerTopTenTable;
