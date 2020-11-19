import React from 'react';
import PropTypes from 'prop-types';
import {
  AppBar, Avatar, Box, Container, Tab, Tabs, Toolbar,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { NavLink, useLocation } from 'react-router-dom';

import NotFound from './NotFound';
import { lookupTabNumByPath } from '../utils/tabHelper';

import logo from '../../images/RLL_logo.png';

export const SEASONS = [1, 2, 3, 4];

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    '& > *': {
      margin: theme.spacing(1),
    },
  },
  mainContent: {
    // hide scrollbars but still allow scrolling
    overflow: 'scroll',
    scrollbarWidth: 'none', /* Firefox */
    '&::-webkit-scrollbar': { /* WebKit */
      width: 0,
      height: 0,
    },
    textAlign: 'center',
  },
  contentContainer: {
    position: 'absolute',
    top: 48,
    width: `calc(100% - ${theme.spacing(4)}px) !important`,
    margin: theme.spacing(1),
    backgroundColor: theme.palette.primary.main,
  },
  menuIcon: {
    marginLeft: -8,
    marginRight: theme.spacing(2),
  },
  menuDrawer: {
    width: 160,
    paddingLeft: theme.spacing(2),
    fontVariant: 'small-caps',
  },
}));

const defaultProps = {
  children: <NotFound />,
};

export default function BaseApp(props) {
  const { children } = props;

  const location = useLocation();
  const pathNum = lookupTabNumByPath(location.pathname);

  const [tabValue, setTab] = React.useState(pathNum);
  const classes = useStyles();

  const handleTabChange = (event, newTab) => {
    setTab(newTab);
  };

  return (
    <div>
      <AppBar position="fixed">
        <Toolbar variant="dense">
          <Avatar src={logo} className={classes.mainLogo} />
          <Tabs id="main-header" value={tabValue} onChange={handleTabChange}>
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
            <Tab
              label="teams"
              component={NavLink}
              to="/teams"
            />
            <Tab
              label="videos"
              component={NavLink}
              to="/videos"
            />
          </Tabs>
        </Toolbar>
      </AppBar>
      <Box id="main-content" bgcolor="primary.main" className={classes.mainContent}>
        <Container className={classes.contentContainer} maxWidth={false}>
          {children}
        </Container>
      </Box>
    </div>
  );
}

BaseApp.propTypes = {
  children: PropTypes.element,
};
BaseApp.defaultProps = defaultProps;
