import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { ThemeProvider } from '@material-ui/core/styles';
import { Provider } from 'react-redux';

import store from './store/store';
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
      <Provider store={store}>
        <Root />
      </Provider>
    </ThemeProvider>
  </AppContainer>,
  document.getElementById('app'),
);

if (module.hot) {
  module.hot.accept('./components/Root', () => {
    const NewRoot = require('./components/Root').default; // eslint-disable-line global-require
    render(
      <AppContainer>
        <ThemeProvider theme={baseTheme}>
          <NewRoot />
        </ThemeProvider>
      </AppContainer>,
      document.getElementById('app'),
    );
  });
}
