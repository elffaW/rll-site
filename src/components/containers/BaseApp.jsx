import React from 'react';
import PropTypes from 'prop-types';
import {
  Avatar, AppBar, Tabs, Tab, Container,
} from '@material-ui/core';
import { NavLink } from 'react-router-dom';

import NotFound from './NotFound';

import logo from '../../images/RLL_logo.png';
import { version } from '../../../package.json';

const defaultProps = {
  children: <NotFound />,
  fullScreen: false,
};

export default function BaseApp(props) {
  const { children, fullScreen } = props;

  const [tabValue, setTab] = React.useState(0);

  let mainContent = (
    <div id="main-content">
      <Container style={{ height: 'calc(100vh - 82px)' }}>
        { children }
      </Container>
    </div>
  );
  if (fullScreen) {
    mainContent = children;
  }

  const handleTabChange = (event, newTab) => {
    setTab(newTab);
  };

  return (
    <AppBar>
      <Avatar src={logo} />
      <p>
        {`v${version}`}
      </p>
      <Tabs id="main-header" variant="fullWidth" value={tabValue} onChange={handleTabChange}>
        <Tab
          label="dashboard"
          component={NavLink}
          exact
          to="/"
        />
        <Tab
          label="rules"
          component={NavLink}
          to="/rules"
        />
        <Tab
          label="schedule"
          component={NavLink}
          to="/schedule"
        />
        <Tab
          label="stats"
          component={NavLink}
          to="/stats"
        />
        <Tab
          label="players"
          component={NavLink}
          to="/players"
        />
      </Tabs>

      {mainContent}
    </AppBar>
  );
}

BaseApp.propTypes = {
  children: PropTypes.element,
  fullScreen: PropTypes.bool,
};
BaseApp.defaultProps = defaultProps;
