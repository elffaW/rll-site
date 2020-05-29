import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid, Paper } from '@material-ui/core';

import BaseApp from './BaseApp';
import PlayerCard from '../PlayerCard';
import { styles as paperStyles } from '../../styles/themeStyles';

// eslint-disable-next-line import/no-unresolved
// const Config = require('Config');

export const playersData = [{
  id: 0, name: 'DanBot', rlName: 'DanBot', car: 'ENDO', value: 8.6, goals: 32, assists: 12,
}, {
  id: 1, name: 'Matt K', rlName: 'Kawa', car: 'ROADHOG', value: 8.4, goals: 31, assists: 12,
}, {
  id: 2, name: 'Speder', rlName: '', car: 'BREAKOUT', value: 6.6, goals: 22, assists: 12,
}, {
  id: 3, name: 'Matt Aux', rlName: '', car: 'DOMINUS', value: 6.5, goals: 12, assists: 12,
}, {
  id: 4, name: 'PDT', rlName: 'dethorne', car: 'HOTSHOT', value: 5.6, goals: 11, assists: 12,
}, {
  id: 5, name: 'Sanchez', rlName: '', car: 'MERC', value: 5.6, goals: 12, assists: 12,
}, {
  id: 6, name: 'TC', rlName: 'pink rock', car: 'OCTANE', value: 5.6, goals: 1, assists: 12,
}, {
  id: 7, name: 'Mark P', rlName: 'Primiano', car: 'PALADIN', value: 2.6, goals: 12, assists: 12,
}, {
  id: 8, name: 'Tom', rlName: '', car: 'TAKUMI', value: 2.6, goals: 12, assists: 12,
}, {
  id: 9, name: 'Mike', rlName: 'elffaW', car: 'VENOM', value: 5.6, goals: 12, assists: 12,
}, {
  id: 10, name: 'Shanley', rlName: '', car: 'XDEVIL', value: 5.6, goals: 12, assists: 12,
}, {
  id: 11, name: 'Singley', rlName: '', car: 'ZIPPY', value: 2.6, goals: 12, assists: 12,
}, {
  id: 12, name: 'Jay', rlName: 'tuna', car: 'ROADHOG', value: 5.6, goals: 12, assists: 12,
}, {
  id: 13, name: 'JR', rlName: 'jr6969', car: 'ROADHOG', value: 5.6, goals: 12, assists: 12,
}, {
  id: 14, name: 'ClunElissa', rlName: '', car: 'BREAKOUT', value: 2.6, goals: 12, assists: 12,
}, {
  id: 15, name: 'Myrvold', rlName: 'Myrv', car: 'ROADHOG', value: 2.6, goals: 12, assists: 12,
}, {
  id: 16, name: 'Andy', rlName: '', car: 'MERC', value: 5.6, goals: 12, assists: 12,
}, {
  id: 17, name: 'Billy', rlName: 'Twerp', car: 'PALADIN', value: 5.6, goals: 12, assists: 12,
}, {
  id: 18, name: 'Mitch', rlName: '', car: 'ROADHOG', value: 2.6, goals: 12, assists: 12,
}, {
  id: 19, name: 'Cohn', rlName: '', car: 'PALADIN', value: 2.6, goals: 12, assists: 12,
}, {
  id: 20, name: 'Matt H', rlName: '', car: 'VENOM', value: 2.6, goals: 12, assists: 12,
}, {
  id: 21, name: 'Marley', rlName: '', car: 'MERC', value: 12.6, goals: 112, assists: 12,
}, {
  id: 22, name: 'C-Block', rlName: '', car: 'MERC', value: 22.6, goals: 132, assists: 12,
}, {
  id: 23, name: 'Jester', rlName: '', car: 'MERC', value: 32.6, goals: 126, assists: 12,
}];

class Players extends Component {
  constructor(props) {
    super(props);

    // get all data for this page

    this.state = {
      players: playersData.sort((a, b) => b.value - a.value), // sort with higher value at top
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
    const isInTeam = match.path.split('/')[1] === 'players';
    return (
      <BaseApp>
        <Paper className={classes.paper}>
          <Grid container spacing={2} justify="center">
            {playerName ? (
              <PlayerCard playerName={playerName} />
            ) : (
              players.map((player) => (
                <PlayerCard player={player} inTeam={isInTeam} />
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
