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
    float: 'left',
    paddingRight: theme.spacing(1),
    width: '65%',
    height: '65%',
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
  fieldValue: {
    fontWeight: 700,
  },
}));

const GoalsTopTenTable = (props) => {
  const classes = useStyles();
  const {
    list, field, title, unit, fieldFriendly, precision,
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
      let listToSort = list;
      if (field === 'distanceToGoal') {
        listToSort = list.filter((el) => el.distanceToGoal > 0);
      }
      switch (typeof list[0][field]) {
        case 'string':
          if (sortByMost) {
            newTopTen = listToSort.sort((a, b) => a[field].localeCompare(b[field])).slice(0, 10);
          } else {
            newTopTen = listToSort.sort((a, b) => b[field].localeCompare(a[field])).slice(0, 10);
          }
          break;
        case 'number':
        default:
          if (sortByMost) {
            newTopTen = listToSort.sort((a, b) => parseFloat(b[field]) - parseFloat(a[field])).slice(0, 10);
          } else {
            newTopTen = listToSort.sort((a, b) => parseFloat(a[field]) - parseFloat(b[field])).slice(0, 10);
          }
          break;
      }
    } else {
      newTopTen = list && list.length > 0 ? list.slice(0, 10) : [];
    }

    setTopTen(newTopTen);
  }, [sortByMost, field]);

  if (list.length < 1 || topTen.length < 1) {
    return '';
  }
  console.log(list);

  const fieldLabel = fieldFriendly && fieldFriendly !== '' ? fieldFriendly : field;

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
            <Typography className={`${classes.tableHeader} ${classes.leftPad}`}>Rk</Typography>
          </Grid>
          <Grid item xs={1}>
            <Typography className={classes.tableHeader}>Ssn</Typography>
          </Grid>
          <Grid item xs={6}>
            <Grid container direction="row" alignItems="flex-start" justify="flex-start">
              <Grid item xs={2}>
                <Typography className={`${classes.tableHeader} ${classes.elemName}`}>Tm</Typography>
              </Grid>
              <Grid item xs={10}>
                <Typography className={`${classes.tableHeader} ${classes.elemName}`}>Player</Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={1}>
            <Typography className={`${classes.tableHeader} ${classes.elemName}`}>Opp</Typography>
          </Grid>
          <Grid item xs={3}>
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
            <Grid item xs={1}>
              <Typography variant="h4" className={`${classes.seasonNum} player-mini-season-${elem.season}`}>
                <span className={`player-season-mini-inside-${elem.season}`}>
                  {elem.season}
                </span>
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Grid container direction="row" alignItems="flex-end" justify="flex-start">
                <Grid item xs={2}>
                  <Link exact to={`/teams/${elem.team?.name}`}>
                    <Avatar src={elem.team?.teamLogo} variant="square" className={classes.teamLogo} alt={elem.team?.name} />
                  </Link>
                </Grid>
                <Grid item xs={10}>
                  <Link exact to={`/players/${elem.playerName}`}>
                    <Typography className={classes.elemName}>{elem.playerName}</Typography>
                  </Link>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={1}>
              <Link exact to={`/teams/${elem.opponent?.name}`}>
                <Avatar src={elem.opponent?.teamLogo} variant="square" className={classes.teamLogo} alt={elem.opponent?.name} />
              </Link>
            </Grid>
            <Grid item xs={3}>
              <Typography className={classes.fieldValue}>
                {parseFloat(elem[field])?.toFixed(precision)}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      ))}
    </Grid>
  );
};

GoalsTopTenTable.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  list: PropTypes.array.isRequired,
  field: PropTypes.string.isRequired,
  fieldFriendly: PropTypes.string,
  title: PropTypes.string,
  unit: PropTypes.string,
  precision: PropTypes.number,
};
GoalsTopTenTable.defaultProps = {
  fieldFriendly: '',
  title: '',
  unit: '',
  precision: 0,
};

export default GoalsTopTenTable;
