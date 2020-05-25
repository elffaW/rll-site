import React from 'react';

import AppRouter from './containers/AppRouter';

import '../styles/styles.scss';

export default function Root() {
  return (
    <div id="router-container">
      <AppRouter />
    </div>
  );
}
