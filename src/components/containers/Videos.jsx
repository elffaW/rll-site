import React from 'react';
import {
  Grid, Paper, Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
// import ReactPlayer from 'react-player';

import BaseApp from './BaseApp';
import PageHeader from '../PageHeader';

const allVideos = [
  { name: 'Season 1 - Promo', googleUrl: 'https://drive.google.com/file/d/1xvSitSxdw-GHjqJtuGXQ82Lu72XGtDDy' },
  { name: 'Season 1 - Playoffs', googleUrl: 'https://drive.google.com/file/d/141UnvusEkQ-CMK0V0bxsDpUpglcFqlkK' },
  { name: 'Season 1 - HotCops Banner Raising Ceremony', googleUrl: 'https://drive.google.com/file/d/1Hsog1vtIVya1wlsgm3PrQCBJuwgycCmD' },
  { name: 'Season 1 - Gameweek 2 report', googleUrl: 'https://drive.google.com/file/d/1LqxgOEdBdUiTjN1OfIaTebaohSV1aE0c' },
  { name: 'Season 1 - Gameweek 3 report', googleUrl: 'https://drive.google.com/file/d/1OKS4u0HZgCbDt92SdnFEWwqm0k65dKjS' },
  { name: 'Season 1 - Gameweek 4 report', googleUrl: 'https://drive.google.com/file/d/1qt4BD3MxBGrIB35XnZFZOE4fclVGI6G5' },
  { name: 'Season 1 - Gameweek 5 report', googleUrl: 'https://drive.google.com/file/d/1QNdMQZD6xoaOgvMBh4LI8Qnc6HWqRq-v' },
  { name: 'Season 2 - Draft (pre-trades)', googleUrl: 'https://drive.google.com/file/d/12w98pbZAp0BPZW_9atR6KL7BVxsJYUlh' },
  { name: 'Season 2 - Promo', googleUrl: 'https://drive.google.com/file/d/1KeAw1knIU7Q8x-9GWHFVIDvlEiz82V3J' },
];

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(1),
    textAlign: 'center',
    backgroundColor: theme.palette.primary.light,
    width: '100%',
  },
}));

function Videos() {
  const classes = useStyles();
  return (
    <BaseApp>
      <Grid container spacing={6} justify="center">
        <Grid item xs={12}>
          <PageHeader headerText="RLL Video Archive" />
        </Grid>
        {allVideos.map((video) => (
          <Grid item>
            <Paper className={classes.paper} style={{ padding: 8 }}>
              <Typography variant="h5" style={{ fontVariant: 'small-caps' }}>{video.name}</Typography>
              {/* <ReactPlayer url={`${video.googleUrl}`} light controls width="" height="" /> */}
              <iframe src={`${video.googleUrl}/preview`} title={video.name} width="720" height="405" />
            </Paper>
          </Grid>
        ))}
      </Grid>
    </BaseApp>
  );
}

export default Videos;
