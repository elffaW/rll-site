import React, { Component } from 'react';

import {
  Grid, Paper,
} from '@material-ui/core';

import BaseApp from './BaseApp';

// import RulesComponent from '../../LEAGUE_RULES.md';
import rules from '../../LEAGUE_RULES.md';

// const rules = '# this is a header\n\nand this is a paragraph';

export default class Rules extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  componentDidMount() {
    // get all data for this page
  }

  render() {
    return (
      <BaseApp>
        <Grid container spacing={2} style={{ height: 'calc(100% - 20px)' }}>
          <Paper style={{ height: '100%', width: '100%' }}>
            <iframe title="rll-rules-doc" height="100%" width="100%" src="https://docs.google.com/document/d/e/2PACX-1vQwNI9u1UmAMFSa514Tye7tesKJPEsFxogNkwhrkAWtaBoLMNdy0lOXUSz9g953skcSnwZr9HC_omB_/pub?embedded=true" />
            {/* <ReactMarkdown source={rules} /> */}
            {/* <RulesComponent /> */}
          </Paper>
        </Grid>
      </BaseApp>
    );
  }
}

Rules.propTypes = {

};
