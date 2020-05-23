import React, { Component } from 'react';

import AppRouter from './containers/AppRouter';

export default class Root extends Component {
  render() {
    return (
      <div id="router-container">
        <AppRouter />
      </div>
    );
  }
}
