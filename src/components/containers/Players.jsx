import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Grid,
  Header,
  Icon,
} from '@material-ui/core';

import BaseApp from './BaseApp';
import PlayerCard from '../PlayerCard';
import NotFound from './NotFound';

// eslint-disable-next-line import/no-unresolved
// const Config = require('Config');

export default class Players extends Component {
  constructor(props) {
    super(props);

    this.state = {
      players: [],
      selectedPlayer: {},
    };
  }

  // componentDidMount() {
  //   // get all data for this page

  //   // get the players
  //   fetch(`${Config.apiHost}/resources/players`, {
  //     method: 'get',
  //     headers: {
  //       Accept: 'application/json',
  //     },
  //   }).then((response) => {
  //     if (response.ok) {
  //       response.json()
  //         .then((playersResponse) => {
  //           const playersData = playersResponse.content;
  //           this.setState({ players: playersData });
  //         });
  //     } else {
  //       toast.error(
  //         <Toaster level="error">
  //           {`Error retrieving players info from server, response: ${response.status} (${response.statusText})`}
  //         </Toaster>,
  //         { className: 'toast-error' },
  //       );
  //     }
  //   }).catch((err) => {
  //     toast.error(
  //       <Toaster level="error">
  //         {`Error retrieving players info from server: ${JSON.stringify(err, null, 2)}`}
  //       </Toaster>,
  //       { className: 'toast-error' },
  //     );
  //   });
  // }

  // componentDidUpdate(prevProps) {
  //   const { match } = this.props;
  //   const { params } = match;
  //   const { playerName } = params;

  //   if (playerName && (playerName !== prevProps.match.params.playerName)) {
  //     fetch(`${Config.apiHost}/resources/players/${playerName}`, {
  //       method: 'get',
  //       headers: {
  //         Accept: 'application/json',
  //       },
  //     }).then((response) => {
  //       if (response.ok) {
  //         response.json()
  //           .then((userResponse) => {
  //             const selectedPlayer = userResponse;

  //             this.setState({ selectedPlayer });
  //           });
  //       } else {
  //         toast.error(
  //           <Toaster level="error">
  //             {`Error retrieving user info from server, response: ${response.status} (${response.statusText})`}
  //           </Toaster>,
  //           { className: 'toast-error' },
  //         );
  //       }
  //     }).catch((err) => {
  //       toast.error(
  //         <Toaster level="error">
  //           {`Error retrieving user info from server: ${JSON.stringify(err, null, 2)}`}
  //         </Toaster>,
  //         { className: 'toast-error' },
  //       );
  //     });
  //   }
  // }

  render() {
    const { match } = this.props;
    const { params } = match;
    const { playerName } = params;
    return (
      <BaseApp>
        <Grid container spacing={2} justify="center">
          {playerName ? (
            <PlayerCard playerName={playerName} />
          ) : (
            <NotFound />
          )}
        </Grid>
      </BaseApp>
    );

    // const { players, selectedPlayer } = this.state;
    // const { match } = this.props;
    // const { params } = match;
    // const { playerName } = params;

    // const userCards = [];
    // if (Object.entries(selectedPlayer).length > 0 && playerName) {
    //   // const followingArray = selectedPlayer.following;
    //   // const showDetails = true;
    //   userCards.push(
    //     <Grid.Column key={`${playerName}_player-card`} width={16}>
    //       <PlayerCard
    //         playerName={playerName}
    //         // name={`${selectedPlayer['first-name']} ${selectedPlayer['last-name']}`}
    //         // likedModels={likesArray}
    //         // subscribedModels={subModelsArray}
    //         // followedPlayers={followingArray}
    //         // followedByPlayers={followersArray}
    //         // showDetails={showDetails}
    //       />
    //     </Grid.Column>,
    //   );
    // } else {
    //   for (let i = 0; i < players.length; i++) {
    //     const user = players[i];

    //     userCards.push(
    //       <Grid.Column key={`${user.id}_player-card`} width={16}>
    //         <PlayerCard
    //           playerName={user.id}
    //           // name={`${user['first-name']} ${user['last-name']}`}
    //           // likedModels={[]}
    //           // subscribedModels={[]}
    //           // followedPlayers={[]}
    //           // followedByPlayers={[]}
    //           // showDetails={false}
    //         />
    //       </Grid.Column>,
    //     );
    //   }
    // }

    // return (
    //   <BaseApp>
    //     <Grid divided="vertically" inverted>
    //       <Grid.Row columns={16}>
    //         <Grid.Column width={16}>
    //           <Header inverted as="span">
    //             All Players
    //           </Header>
    //           <span style={{ float: 'right' }}>
    //             <Icon
    //               name="players"
    //               size="large"
    //             />
    //           </span>
    //         </Grid.Column>
    //       </Grid.Row>

    //       <Grid.Row columns={16}>
    //         {userCards}
    //       </Grid.Row>
    //     </Grid>
    //   </BaseApp>
    // );
  }
}

Players.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  match: PropTypes.object.isRequired,
};
