import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
} from 'react-router-dom';

import BaseApp from './BaseApp';
import Dashboard from './Dashboard';
import Rules from './Rules';
// import ScheduleDetails from './ScheduleDetails';
import Schedule from './Schedule';
// import PlayerStats from './PlayerStats';
import Stats from './Stats';
import Fantasy from './Fantasy';
import Players from './Players';
import Teams from './Teams';
import Videos from './Videos';
import Standings from '../Standings';

export default function AppRouter() {
  return (
    <Router basename="/">
      <div className="App">

        <div className="container">

          <Switch>
            {/* RULES ROUTES */}
            <Route path="/rules" component={Rules} />
            {/* SCHEDULE ROUTES */}
            {/* <Route path="/schedule/:weekNum" component={ScheduleDetails} /> */}
            <Route path="/schedule/:gameNum" component={Schedule} />
            <Route path="/schedule" component={Schedule} />
            {/* PLAYER ROUTES */}
            <Route path="/teams/:teamName" component={Teams} />
            <Route path="/teams" component={Teams} />
            <Route path="/players/:playerName" component={Players} />
            <Route path="/players" component={Players} />
            {/* STATS ROUTES */}
            {/* <Route path="/stats/:playerId" component={PlayerStats} /> */}
            <Route path="/stats" component={Stats} />
            <Route path="/fantasy" component={Fantasy} />
            {/* VIDEOS */}
            <Route path="/videos" component={Videos} />
            <Route path="/standings" component={Standings} />
            {/* DASHBOARD AND NOT-FOUND ROUTES */}
            <Route exact path="/" component={Dashboard} />
            <Route component={BaseApp} />
          </Switch>

        </div>
      </div>
    </Router>
  );
}
