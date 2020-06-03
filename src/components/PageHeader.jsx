import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  headerText: {
    fontVariant: 'small-caps',
    padding: theme.spacing(2),
    paddingBottom: theme.spacing(4),
    color: theme.otherColors.text.light,
  },
}));

export default function PageHeader(props) {
  const { headerText } = props;
  const classes = useStyles();
  return (
    <Typography variant="h3" className={classes.headerText}>
      {headerText}
    </Typography>
  );
}

PageHeader.propTypes = {
  headerText: PropTypes.string.isRequired,
};
