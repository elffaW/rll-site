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
import Players from './Players';
import Teams from './Teams';
import Videos from './Videos';
import Standings from './Standings';

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
            <Route path="/schedule" component={Schedule} />
            {/* STATS ROUTES */}
            {/* <Route path="/stats/:playerId" component={PlayerStats} /> */}
            <Route path="/stats" component={Stats} />
            {/* PLAYER ROUTES */}
            <Route path="/players/:playerName" component={Players} />
            <Route path="/players" component={Players} />
            <Route path="/teams/:teamName" component={Teams} />
            <Route path="/teams" component={Teams} />
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
