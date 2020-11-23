import React from 'react';
import { Grid } from '@material-ui/core';

import BaseApp from './BaseApp';
import FantasyPlayers from '../FantasyPlayers';
import PageHeader from '../PageHeader';

export default function Fantasy() {
  return (
    <BaseApp>
      <Grid container spacing={2} justify="center">
        <Grid item xs={12}>
          <PageHeader headerText="Fantasy Rocket League League League" />
        </Grid>
        <Grid item xs={12}>
          <FantasyPlayers />
        </Grid>
      </Grid>
    </BaseApp>
  );
}
