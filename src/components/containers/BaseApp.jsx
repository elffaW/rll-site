import React from 'react';
import PropTypes from 'prop-types';
import {
  AppBar, Avatar, Box, Container, Tab, Tabs, Toolbar, Button, Menu, MenuItem,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { NavLink, useLocation } from 'react-router-dom';

import NotFound from './NotFound';
import { lookupTabNumByPath } from '../utils/tabHelper';

import logo from '../../images/RLL_logo.png';

export const SEASONS = [1, 2, 3, 4, 5, 6];

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    '& > *': {
      margin: theme.spacing(1),
    },
  },
  headerButton: {
    fontFamily: 'Oswald, Roboto, sans-serif',
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
    top: theme.spacing(6),
    width: `calc(100% - ${theme.spacing(4)}px) !important`,
    margin: theme.spacing(1),
    backgroundColor: theme.palette.primary.main,
  },
  menuIcon: {
    marginLeft: -theme.spacing(1),
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
  const [rostersAnchor, setRostersAnchor] = React.useState(null);
  const rostersOpen = Boolean(rostersAnchor);

  const handleRostersMenu = (event) => {
    setRostersAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setRostersAnchor(null);
  };

  const handleTabChange = (event, newTab) => {
    setTab(newTab);
  };

  const otherButton = (props) => (
    <Button
      aria-label="teams and players"
      aria-controls="menu-appbar-rosters"
      aria-haspopup="true"
      onClick={handleRostersMenu}
      color="inherit"
      className={classes.headerButton}
      style={pathNum > 4 ? { color: 'inherit' } : {}}
    >
      Other
    </Button>
  );

  return (
    <div>
      <AppBar position="fixed">
        <Toolbar variant="dense">
          <Avatar src={logo} className={classes.mainLogo} />
          <Tabs id="main-header" value={tabValue} onChange={handleTabChange}>
            <Tab
              label="home"
              component={NavLink}
              exact
              to="/"
            />
            <Tab
              label="schedule"
              component={NavLink}
              to="/schedule"
            />
            <Tab
              label="teams"
              component={NavLink}
              to="/teams"
            />
            <Tab
              label="players"
              component={NavLink}
              to="/players"
            />
            <Tab
              label="stats"
              component={NavLink}
              to="/stats"
            />
            <Tab
              label="other"
              aria-label="teams and players"
              aria-controls="menu-appbar-rosters"
              aria-haspopup="true"
              onClick={handleRostersMenu}
              color="inherit"
              className={classes.headerButton}
            />
          </Tabs>
          <Menu
            id="menu-appbar-rosters"
            anchorEl={rostersAnchor}
            keepMounted
            open={rostersOpen}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
          >
            <MenuItem
              component={NavLink}
              to="/fantasy"
              onClick={handleClose}
            >
              Fantasy
            </MenuItem>
            <MenuItem
              component={NavLink}
              to="/rules"
              onClick={handleClose}
            >
              Rules
            </MenuItem>
            <MenuItem
              component={NavLink}
              to="/videos"
              onClick={handleClose}
            >
              Videos
            </MenuItem>
          </Menu>
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
