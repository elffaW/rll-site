import React from 'react';
import PropTypes from 'prop-types';
import { Avatar, Tooltip } from '@material-ui/core';
import { Link } from 'react-router-dom';

export default function TeamIcon({ team }) {
  const logoSrc = require(`../images/LOGO_${team.toUpperCase()}.png`); // eslint-disable-line
  return (
    <Tooltip title={team}>
      <Link to={`/teams/${team}`} exact>
        <Avatar src={logoSrc} variant="square" />
      </Link>
    </Tooltip>
  );
}

TeamIcon.propTypes = {
  team: PropTypes.string.isRequired,
};
