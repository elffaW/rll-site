import React from 'react';

import { NavLink } from 'react-router-dom';

import { Icon } from '@material-ui/core';

export default function NotFound() {
  return (
    <div>
      <h1>
        <Icon style={{ float: 'left' }} name="frown" size="massive" loading />
        Error 404: Not Found
      </h1>
      <h2>
        The page you were looking for was not found. Click
        <NavLink to="/" exact>
          here
        </NavLink>
        to go back to the main dashboard.
      </h2>
    </div>
  );
}
