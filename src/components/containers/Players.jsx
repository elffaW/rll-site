import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid, Paper } from '@material-ui/core';

import BaseApp from './BaseApp';
import PlayerCard from '../PlayerCard';
import { styles as paperStyles } from '../../styles/themeStyles';

// eslint-disable-next-line import/no-unresolved
// const Config = require('Config');

const playersData = [{
  id: 0, name: 'DanBot', rlName: 'DanBot',
}, {
  id: 1, name: 'Matt K', rlName: 'Kawa',
}, {
  id: 2, name: 'Speder', rlName: '',
}, {
  id: 3, name: 'Matt Aux', rlName: '',
}, {
  id: 4, name: 'PDT', rlName: 'dethorne',
}, {
  id: 5, name: 'Sanchez', rlName: '',
}, {
  id: 6, name: 'TC', rlName: 'pink rock',
}, {
  id: 7, name: 'Mark P', rlName: '',
}, {
  id: 8, name: 'Tom', rlName: '',
}, {
  id: 9, name: 'Mike', rlName: 'elffaW',
}, {
  id: 10, name: 'Shanley', rlName: '',
}, {
  id: 11, name: 'Singley', rlName: '',
}, {
  id: 12, name: 'Jay', rlName: 'tuna',
}, {
  id: 13, name: 'JR', rlName: 'jr6969',
}, {
  id: 14, name: 'ClunElissa', rlName: '',
}, {
  id: 15, name: 'Myrvold', rlName: '',
}, {
  id: 16, name: 'Andy', rlName: '',
}, {
  id: 17, name: 'Billy', rlName: 'Twerp',
}, {
  id: 18, name: 'Mitch', rlName: '',
}, {
  id: 19, name: 'Cohn', rlName: '',
}, {
  id: 20, name: 'Matt H', rlName: '',
}];


class Players extends Component {
  constructor(props) {
    super(props);

    // get all data for this page

    this.state = {
      players: playersData,
      selectedPlayer: {},
    };
  }

  componentDidMount() {

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
  }

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
    const { players, selectedPlayer } = this.state;
    const { classes, match } = this.props;
    const { params } = match;
    const { playerName } = params;
    console.log(match);
    const inTeam = match.path.split('/')[1] === 'players';
    return (
      <BaseApp>
        <Paper className={classes.paper}>
          <Grid container spacing={2} justify="center">
            {playerName ? (
              <PlayerCard playerName={playerName} />
            ) : (
              players.map((player) => (
                <PlayerCard playerName={player.name} inTeam />
              ))
            )}
          </Grid>
        </Paper>
      </BaseApp>
    );

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
  classes: PropTypes.string,
};
Players.defaultProps = {
  classes: '',
};

export default paperStyles(Players);
