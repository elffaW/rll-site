import React, { useState } from 'react';
import {
  Grid, Paper,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { isEqual } from 'lodash';

import BaseApp from './BaseApp';
import PageHeader from '../PageHeader';
import NetlifyForm from './NetlifyForm';
import LeagueRules from '../../LEAGUE_RULES.mdx';

const useStyles = makeStyles((theme) => ({
  rulesGrid: {
    height: 'calc(100vh - 172px)',
    padding: theme.spacing(1),
  },
  paper: {
    padding: theme.spacing(1),
    margin: theme.spacing(1),
    backgroundColor: theme.palette.primary.light,
    maxWidth: 840,
    width: '100%',
  },
  rulesPaper: {
    paddingTop: theme.spacing(1),
    paddingRight: theme.spacing(4),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(4),
  },
}));

export default function Rules() {
  const classes = useStyles();
  const [triggerForm, setTriggerForm] = useState(false);

  const keycodes = [];
  const keyListener = (e) => {
    keycodes.push(e.code);
    if (keycodes.length > 10) {
      keycodes.shift();
    }
    // console.log('keycodes:', keycodes);
    if (isEqual([
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'KeyB',
      'KeyA',
    ], keycodes)) {
      setTriggerForm(true);
    }
  };

  document.addEventListener('keydown', keyListener);

  const handleSubmit = (name) => {
    const encode = (data) => Object.keys(data)
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
      .join('&');

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encode({ 'form-name': 'db-form', name }),
    })
      .then(() => alert('Success!'))
      .catch((error) => alert(error));

    // e.preventDefault();
  };

  const showMDXRules = false;

  return (
    <BaseApp>
      {triggerForm && <NetlifyForm handleSubmit={handleSubmit} />}
      <PageHeader headerText="Rocket League League league rules" />
      {showMDXRules ? (
        <Grid container spacing={2} justify="center">
          <Paper className={`${classes.paper} ${classes.rulesPaper}`} style={{ textAlign: 'left' }}>
            <LeagueRules />
          </Paper>
        </Grid>
      ) : (
        <Grid container spacing={2} className={classes.rulesGrid} justify="center">
          <Paper className={classes.paper}>
            <iframe
              title="rll-rules-doc"
              height="100%"
              width="100%"
              src="https://docs.google.com/document/d/e/2PACX-1vQwNI9u1UmAMFSa514Tye7tesKJPEsFxogNkwhrkAWtaBoLMNdy0lOXUSz9g953skcSnwZr9HC_omB_/pub?embedded=true"
            />
            {/* <ReactMarkdown source={rules} /> */}
          </Paper>
        </Grid>
      )}
    </BaseApp>
  );
}

Rules.propTypes = {

};
