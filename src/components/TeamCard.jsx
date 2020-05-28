import React from 'react';
import PropTypes from 'prop-types';
import {
  Grid, Paper, Avatar, Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import PlayerCard from './PlayerCard';

import logo from '../images/RLL_logo.svg';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(1),
    margin: theme.spacing(1),
    textAlign: 'center',
    backgroundColor: theme.palette.primary.light,
    maxWidth: 840,
    width: '100%',
  },
  teamIcon: {
    width: theme.spacing(12),
    height: theme.spacing(12),
  },
  teamName: {
    fontVariant: 'small-caps',
    fontWeight: 700,
    float: 'left',
    marginLeft: theme.spacing(2),
    color: 'whitesmoke',
  },
  teamDesc: {
    fontVariant: 'small-caps',
    fontSize: '1.6em',
  },
  teamRecord: {
    fontVariant: 'small-caps',
    fontSize: '1.6em',
    color: 'whitesmoke',
    fontWeight: 700,
  },
}));

function TeamCard(props) {
  const { team } = props;
  const classes = useStyles();
  const logoSrc = require(`../images/${team.name}.png`);
  return (
    <Grid item xs={3}>
      <Paper className={classes.paper}>
        <Grid container alignItems="center" justify="flex-start">
          <Grid item xs={2}>
            <Avatar src={logoSrc} className={classes.teamIcon} />
          </Grid>
          <Grid item xs={9}>
            <Typography variant="h3" className={classes.teamName}>{team.name}</Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography className={classes.teamRecord}>10 - 2</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography className={classes.teamDesc}>1st place</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography className={classes.teamDesc}>15 pts</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography className={classes.teamDesc}>$18.6M</Typography>
          </Grid>
          {team.members.map((member) => (
            <PlayerCard playerName={member} inTeam />
          ))}
        </Grid>
      </Paper>
    </Grid>
  );
}

TeamCard.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  team: PropTypes.object.isRequired,
};

export default TeamCard;

// import React, { Component } from 'react';
// import PropTypes from 'prop-types';
// import { toast } from 'react-toastify';
// import fetch from 'cross-fetch';

// import {
//   Card,
//   Icon,
//   Button,
//   Item
// } from 'semantic-ui-react';

// import { NavLink } from 'react-router-dom';

// import Toaster from './Toaster';

// import * as ModelUtils from '../utils/ModelUtils';

// // eslint-disable-next-line import/no-unresolved
// const Config = require('Config');

// export default class UserCard extends Component {
//   static defaultProps = {
//     likedModels: [],
//     subscribedModels: [],
//     followedUsers: [],
//     followedByUsers: []
//   };

//   constructor(props) {
//     super(props);

//     this.state = {
//       showFollowError: false
//     };
//   }

//   followUser = () => {
//     const { userId } = this.props;
//     // request URL: https://localhost/ace/api/v1/users/C%3DUS%2C%20ST%3DMD%2C%20L%3DColumbia%2C%20O%3D%22SME%2C%20Inc.%22%2C%20OU%3DTesting%2C%20CN%3DCharlie%20Brown%2C%20EMAILADDRESS%3Ddevops%40strategicmissionelements.com
//     // request method: PATCH
//     // Accept: application/vnd.api+json
//     // Accept-Encoding: gzip, deflate, br
//     // Accept-Language: en-US,en;q=0.9
//     // Connection: keep-alive
//     // Content-Length: 790
//     // Content-Type: application/vnd.api+json
//     // payload:
//     // {
//     //   "data":{
//     //     "id":"C=US, ST=MD, L=Columbia, O=\"SME, Inc.\", OU=Testing, CN=Charlie Brown, EMAILADDRESS=devops@strategicmissionelements.com",
//     //     "attributes":{
//     //       "schema-version":"v1",
//     //       "email":"devops@strategicmissionelements.com",
//     //       "first-name":"Charlie","last-name":"Brown",
//     //       "username":null,
//     //       "resource-uri":null,
//     //       "model-type":"User"
//     //     },
//     //     "relationships":{
//     //       "following":{
//     //         "data":[{"type":"users","id":"C=US, ST=MD, L=Columbia, O=\"SME, Inc.\", OU=Testing, CN=Charlie Brown, EMAILADDRESS=devops@strategicmissionelements.com"}]
//     //       },
//     //       "followed-by":{
//     //         "data":[{"type":"users","id":"C=US, ST=MD, L=Columbia, O=\"SME, Inc.\", OU=Testing, CN=Charlie Brown, EMAILADDRESS=devops@strategicmissionelements.com"}]
//     //       },
//     //       "likes":{"data":[{"type":"published-process-models","id":"f0a8b4a7-9834-4e9b-a01e-2ccc3de76603"}]}
//     //     },
//     //     "type":"users"
//     //   }
//     // }

//     ModelUtils.getUserId().then((curUserId) => {
//       if (userId !== curUserId) {
//         toast.warn(
//           <Toaster level="warn">
//             {`Sorry, this operation is not yet supported!`}
//           </Toaster>
//         , { className: 'toast-warn' });
//         /* TODO: make that call in the example comment above to persist user following */
//         // fetch(`${Config.apiHost}/api/v1/users/${userId}`, {
//         //   method: 'PATCH',
//         //   headers: {
//         //     Accept: 'application/vnd.api+json',
//         //     'Accept-Encoding': 'gzip, deflate, br'
//         //   },
//         //   body: /* the payload? */
//         // }).then((response) => {
//         //   if (response.ok) {
//         //     console.log('we did it! saved the updated follower');
//         //   } else {
//         //     console.error(`Bad response persisting follow-user, response: ${response.status}`);
//         //   }
//         // }).catch((err) => {
//         //   console.error(`Error persisting follow-user: ${JSON.stringify(err, null, 2)}`);
//         // });
//       } else {
//         this.setState({ showFollowError: true });

//         setTimeout(() => {
//           this.setState({ showFollowError: false });
//         }, 2000);
//       }
//     }).catch((err) => {
//       toast.error(
//         <Toaster level="error">
//           {`${err} (you may have lost connection to the server)`}
//         </Toaster>
//       , { className: 'toast-error' });
//     });
//   }

//   render() {
//     const {
//       userId,
//       name,
//       likedModels,
//       subscribedModels,
//       followedUsers,
//       followedByUsers,
//       showDetails
//     } = this.props;

//     const { showFollowError } = this.state;

//     let detailedDescription = '';
//     if (showDetails) {
//       detailedDescription = (
//         <Card.Content style={{ paddingTop: 10, paddingBottom: 20 }}>
//           <Item.Group>
//             <Item>
//               <Item.Image size="tiny">
//                 <Icon name="sitemap" size="huge" />
//               </Item.Image>
//               <Item.Content>
//                 <Item.Header style={{ color: 'white', fontWeight: 100 }}>
//                   {`Likes ${likedModels.length} models`}
//                 </Item.Header>
//                 {likedModels.length > 0 ? (
//                   likedModels.map(model => (
//                     <Item.Description style={{ color: 'gray' }}>
//                       {'likes '}
//                       <span style={{ color: 'darkgray', fontWeight: 700 }}>
//                         {`${model.name}`}
//                       </span>
//                     </Item.Description>
//                   ))
//                 ) : ''}
//               </Item.Content>
//             </Item>
//             <Item>
//               <Item.Image size="tiny">
//                 <Icon name="rss" size="huge" />
//               </Item.Image>
//               <Item.Content>
//                 <Item.Header style={{ color: 'white', fontWeight: 100 }}>
//                   {`Subscribed to ${subscribedModels.length} models`}
//                 </Item.Header>
//                 {subscribedModels.length > 0 ? (
//                   subscribedModels.map(model => (
//                     <Item.Description style={{ color: 'gray' }}>
//                       {'subscribed to '}
//                       <span style={{ color: 'darkgray', fontWeight: 700 }}>
//                         {`${model['process-model'].name}`}
//                       </span>
//                     </Item.Description>
//                   ))
//                 ) : ''}
//               </Item.Content>
//             </Item>
//             <Item>
//               <Item.Image size="tiny">
//                 <Icon name="smile" size="huge" />
//               </Item.Image>
//               <Item.Content>
//                 <Item.Header style={{ color: 'white', fontWeight: 100 }}>
//                   {`Follows ${followedUsers.length} users`}
//                 </Item.Header>
//                 {followedUsers.length > 0 ? (
//                   followedUsers.map(user => (
//                     <Item.Description style={{ color: 'gray' }}>
//                       {'follows '}
//                       <span style={{ color: 'darkgray', fontWeight: 700 }}>
//                         {`${user['first-name']} ${user['last-name']}`}
//                       </span>
//                     </Item.Description>
//                   ))
//                 ) : ''}
//               </Item.Content>
//             </Item>
//             <Item>
//               <Item.Image size="tiny">
//                 <Icon name="user secret" size="huge" />
//               </Item.Image>
//               <Item.Content>
//                 <Item.Header style={{ color: 'white', fontWeight: 100 }}>
//                   {`Followed by ${followedByUsers.length} users`}
//                 </Item.Header>
//                 {followedByUsers.length > 0 ? (
//                   followedByUsers.map(user => (
//                     <Item.Description style={{ color: 'gray' }}>
//                       {'followed by '}
//                       <span style={{ color: 'darkgray', fontWeight: 700 }}>
//                         {`${user['first-name']} ${user['last-name']}`}
//                       </span>
//                     </Item.Description>
//                   ))
//                 ) : ''}
//               </Item.Content>
//             </Item>
//           </Item.Group>
//         </Card.Content>
//       );
//     }

//     let bottomButton = (
//       <Button style={{ float: 'right' }} as={NavLink} to={`/users/${userId}`} primary>
//         <Icon name="eye" />
//         {'  View Details'}
//       </Button>
//     );
//     if (showDetails) {
//       bottomButton = (
//         <Button fluid onClick={this.followUser} color="grey">
//           <Icon name="users" />
//           {'  Follow User'}
//         </Button>
//       );
//     }
//     if (showFollowError) {
//       bottomButton = (
//         <Button fluid color="red" basic>
//           <Icon name="users" />
//           {'  Sorry, you can\'t follow yourself!'}
//         </Button>
//       );
//     }

//     return (
//       <Card raised fluid className="dark tight">
//         <Card.Content>
//           <Card.Header>
//             <Icon name="user" />
//             {`  ${name}`}
//             {showDetails ? (
//               <Button style={{ float: 'right' }} as={NavLink} to="/users" primary>
//                 <Icon name="reply" />
//                 {'Back to User List'}
//               </Button>
//             ) : ''}
//           </Card.Header>
//         </Card.Content>
//         {detailedDescription}
//         <Card.Content>
//           {bottomButton}
//         </Card.Content>
//       </Card>
//     );
//   }
// }

// UserCard.propTypes = {
//   userId: PropTypes.string.isRequired,
//   name: PropTypes.string.isRequired,
//   likedModels: PropTypes.array,
//   subscribedModels: PropTypes.array,
//   followedUsers: PropTypes.array,
//   followedByUsers: PropTypes.array,
//   showDetails: PropTypes.bool.isRequired
// };
