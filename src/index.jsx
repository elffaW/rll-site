import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { ThemeProvider } from '@material-ui/core/styles';

import baseTheme from './baseTheme';
import Root from './components/Root';

// import './styles/styles.scss';
// import './styles/card.scss';
// import './styles/datetime.scss';

import 'typeface-roboto';

require('./favicon.ico'); // Tell webpack to load favicon.ico

render(
  <AppContainer>
    <ThemeProvider theme={baseTheme}>
      <Root />
    </ThemeProvider>
  </AppContainer>,
  document.getElementById('app'),
);

if (module.hot) {
  module.hot.accept('./components/Root', () => {
    const NewRoot = require('./components/Root').default; // eslint-disable-line global-require
    render(
      <AppContainer>
        <NewRoot />
      </AppContainer>,
      document.getElementById('app'),
    );
  });
}
