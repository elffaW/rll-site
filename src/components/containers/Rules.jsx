import React from 'react';
import {
  Grid, Paper,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import BaseApp from './BaseApp';
// import rules from '../../LEAGUE_RULES.md';

// const rules = '# this is a header\n\nand this is a paragraph';

const useStyles = makeStyles((theme) => ({
  rulesGrid: {
    height: 'calc(100vh - 56px)',
    padding: theme.spacing(1),
  },
  paper: {
    padding: theme.spacing(1),
    margin: theme.spacing(1),
    textAlign: 'center',
    backgroundColor: theme.palette.primary.main,
    maxWidth: 840,
    width: '100%',
  },
}));

export default function Rules() {
  const classes = useStyles();
  return (
    <BaseApp>
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
    </BaseApp>
  );
}

Rules.propTypes = {

};
