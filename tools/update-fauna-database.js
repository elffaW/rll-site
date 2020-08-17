/* eslint-disable no-use-before-define */
/* bootstrap database in your FaunaDB account */
const readline = require('readline');
const faunadb = require('faunadb');
const chalk = require('chalk');

const { GoogleSpreadsheet } = require('google-spreadsheet');

const insideNetlify = insideNetlifyBuildContext();
const q = faunadb.query;

const { SEASON_NUMBER } = process.env;

if (!SEASON_NUMBER) {
  console.log(chalk.yellow('Required SEASON_NUMBER environment variable not found.'));
  process.exit(1);
}

console.log(chalk.cyan('Updating your FaunaDB Database...\n'));

// 1. Check for required enviroment variables
if (!process.env.FAUNADB_SECRET) {
  console.log(chalk.yellow('Required FAUNADB_SECRET enviroment variable not found.'));
  if (insideNetlify) {
    console.log('Visit https://app.netlify.com/sites/YOUR_SITE_HERE/settings/deploys');
    console.log('and set a `FAUNADB_SECRET` value in the "Build environment variables" section');
    process.exit(1);
  }
  // Local machine warning
  if (!insideNetlify) {
    console.log();
    console.log('You can create fauna DB keys here: https://dashboard.fauna.com/db/keys');
    console.log();
    ask(chalk.bold('Enter your faunaDB server key'), (err, answer) => {
      if (!answer) {
        console.log('Please supply a faunaDB server key');
        process.exit(1);
      }
      getDataFromSheets()
        .then((data) => {
          console.log(chalk.cyan('load db'));
          // console.log(JSON.stringify(data, null, 2));
          updateDatabase(process.env.FAUNADB_SECRET, data).then(() => {
            console.log('Database created');
          }).catch((error) => {
            console.error(error);
          });
        }).catch((e) => {
          console.log(chalk.yellow('error setting up the sheets?', e));
        });
    });
  }
}

// Has var. Do the thing
if (process.env.FAUNADB_SECRET) {
  // required env vars
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
    console.log(chalk.yellow('no GOOGLE_SERVICE_ACCOUNT_EMAIL env var set'));
    process.exit(1);
  }
  if (!process.env.GOOGLE_PRIVATE_KEY) {
    console.log(chalk.yellow('no GOOGLE_PRIVATE_KEY env var set'));
    process.exit(1);
  }
  if (!process.env.GOOGLE_SHEETS_SHEET_ID) {
    // spreadsheet key is the long id in the sheets URL
    console.log(chalk.yellow('no GOOGLE_SHEETS_SHEET_ID env var set'));
    process.exit(1);
  }

  /**
   *

To check whether an index is "active", run the following query (replacing index_name with the name of the index that you want to check):

```
Select("active", Get(Index("index_name")))
```

If you see true in the output, the index is "active" and is ready for your queries. Otherwise, you should wait and check again later, until true appears in the output.

   */
  /**
   * ASSUMPTION: collections and indexes already exist, and have some data in them
   * GOAL:
   * - retrieve records from GSheets for the specified Season
   * - if record exists, update record in Fauna for Players/Games/Teams
   * - if record does not exist, insert record in Fauna for Players/Games/Teams
   *
   * PLAYER:  lookup/unique by [id + season]
   * GAME:    lookup/unique by [id + season]
   * TEAM:    lookup/unique by [id + season]
   *
   * create data queries:
   * - while index !active, setTimeout 500, then retry [query: `Select("active", Get(Index(`all_{collectionName}`)))`]
   * - when index is active: insert data
   */
  getDataFromSheets()
    .then((data) => {
      console.log(chalk.cyan('load db'));
      // console.log(JSON.stringify(data, null, 2));
      updateDatabase(process.env.FAUNADB_SECRET, data).then(() => {
        console.log('Database created');
      }).catch((error) => {
        console.error(error);
      });
    }).catch((err) => {
      console.log(chalk.yellow('error setting up the sheets?', err));
    });
}

/**
 * returns schema from google sheet
 * schema should look like:
 * @example
 * ```
 * {
 *  teams: [{
 *    id: 1, name: 'Real Fake Bots', members: [0, 7, 16], wins: 0, losses: 0, points: 0, rank: 1,
 *  }, ...],
 *  players: [{
 *    id: 0, name: 'DanBot', rlName: 'DanBot', car: 'ENDO', value: 8.6, goals: 32, assists: 12,
 *  }, ...],
 *  games: [{
 *    id: 1, homeTeam: 1, awayTeam: 2, gameWeek: 1, gameTime: '05/29/2020 19:30 -0500', arena: 'Salty Shores',
 *  }, ...],
 * }
 * ```
 */
function getDataFromSheets() {
  return new Promise((resolve, reject) => {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const sheetId = process.env.GOOGLE_SHEETS_SHEET_ID;

    try {
      const doc = new GoogleSpreadsheet(sheetId);
      doc.useServiceAccountAuth({
        client_email: email,
        private_key: privateKey.replace(/\\n/g, '\n'),
      }).then(() => {
        doc.loadInfo().then(() => {
          /**
           * 0: Standings
           * 1: Schedule
           * 2: Leaderboards
           * 3: Playoff Bracket
           * 4: Players
           * 5: Roster
           * 6: Stats
           * 7: EXPORT
           * 8: ROLES
           */
          const playersSheet = doc.sheetsByIndex[4];
          const rolesSheet = doc.sheetsByIndex[8];
          const rostersSheet = doc.sheetsByIndex[5];
          const standingsSheet = doc.sheetsByIndex[0];
          const scheduleSheet = doc.sheetsByIndex[1];
          const statsSheet = doc.sheetsByIndex[6];

          getStatsFromSheets(statsSheet).then((allStats) => {
            getPlayersFromSheets(playersSheet, rolesSheet, allStats).then((allPlayers) => {
              getTeamsFromSheets(rostersSheet, standingsSheet, allPlayers).then((allTeams) => {
                getGamesFromSheets(scheduleSheet, allTeams).then((allGames) => {
                  resolve({
                    players: allPlayers,
                    teams: allTeams,
                    games: allGames,
                  });
                });
              });
            });
          });
        });
      });
    } catch (err) {
      reject(err);
    }
  });
}

function getStatsFromSheets(statsSheet) {
  return new Promise((resolve, reject) => {
    statsSheet.getRows().then((allStats) => {
      const statsRet = {};
      // const statsByGame = {};
      const statsByPlayer = {};
      // const statsByTeam = {};
      allStats.forEach((stats) => {
        const {
          // GN: gameId,
          PLAYER: playerName,
          // TM: teamName,
          // OPP: opposingTeam,
          // 'TM SC': teamGoals,
          // 'OPP SC': opponentGoals,
          SCORE: playerScore,
          G: playerGoals,
          A: playerAssists,
          SV: playerSaves,
          SH: playerShots,
          MVP: playerMVP,
          PTS: playerPts,
          TYPE: statsType,
        } = stats;
        if (playerName) {
          // statsType: RS, PO, SUB, BOT
          if (statsType === 'RS' || statsType === 'PO') {
            if (!statsByPlayer[playerName]) {
              statsByPlayer[playerName] = {
                name: playerName,
                score: parseInt(playerScore, 10),
                goals: parseInt(playerGoals, 10),
                assists: parseInt(playerAssists, 10),
                saves: parseInt(playerSaves, 10),
                shots: parseInt(playerShots, 10),
                numMVP: parseInt(playerMVP, 10),
                points: parseInt(playerPts, 10),
                gamesPlayed: 1,
              };
            } else {
              statsByPlayer[playerName].score += parseInt(playerScore, 10);
              statsByPlayer[playerName].goals += parseInt(playerGoals, 10);
              statsByPlayer[playerName].assists += parseInt(playerAssists, 10);
              statsByPlayer[playerName].saves += parseInt(playerSaves, 10);
              statsByPlayer[playerName].shots += parseInt(playerShots, 10);
              statsByPlayer[playerName].numMVP += parseInt(playerMVP, 10);
              statsByPlayer[playerName].points += parseInt(playerPts, 10);
              statsByPlayer[playerName].gamesPlayed += 1;
            }
          }
        }
      });
      statsRet.statsByPlayer = statsByPlayer;
      resolve(statsRet);
    }).catch((err) => {
      reject(err);
    });
  });
}

/**
  *  players: [{
  *    id: 0, name: 'DanBot', rlName: 'DanBot', car: 'ENDO', value: 8.6, goals: 32, assists: 12,
  *  }, ...],
  */
function getPlayersFromSheets(playersSheet, rolesSheet, allStats) {
  return new Promise((resolve, reject) => {
    playersSheet.getRows().then((allPlayers) => rolesSheet.getRows().then((allRoles) => {
      const playerRoles = [];
      allRoles.forEach((role) => {
        const { PLAYER: playerName, 'ROLE PRIMARY': primaryRole, 'ROLE SECONDARY': secondaryRole } = role;
        playerRoles.push({ playerName, primaryRole, secondaryRole });
      });

      const playersRet = [];
      allPlayers.forEach((player) => {
        const {
          ID: id,
          Name: name,
          'Rocket League Name': rlName,
          'Team Assignment': team,
          Car: car,
          'Signing Value': signingValue,
          'Current Value': value,
          System: system,
          Country: country,
          Position: position,
        } = player;
        const { primaryRole, secondaryRole } = playerRoles.find((role) => role.playerName === name.toUpperCase());
        const {
          score, goals, assists, saves, shots, numMVP, points, gamesPlayed,
        } = allStats.statsByPlayer[name.toUpperCase()];
        const playerObj = {
          id: parseInt(id, 10),
          name,
          rlName,
          team,
          car,
          signingValue,
          primaryRole,
          secondaryRole,
          score,
          goals,
          assists,
          saves,
          shots,
          numMVP,
          points,
          gamesPlayed,
          value,
          system,
          country,
          position,
          season: parseInt(SEASON_NUMBER, 10),
        };
        playersRet.push(playerObj);
      });
      resolve(playersRet);
    })).catch((err) => {
      reject(err);
    });
  });
}

/**
  *  teams: [{
  *    id: 1,
  *    name: 'Real Fake Bots',
  *    members: [{PlayerObj}, {PlayerObj}, {PlayerObj}],
  *    wins: 0,
  *    losses: 0,
  *    points: 0,
  *    rank: 1,
  *    plusMinus: 18,
  *    goalsFor: 22,
  *    goalsAgainst: 4,
  *    value: '18.4M'
  *  }, ...],
  */
function getTeamsFromSheets(rostersSheet, standingsSheet, allPlayers) {
  return new Promise((resolve, reject) => {
    rostersSheet.getRows().then((allRosters) => standingsSheet.getRows().then((allStandings) => {
      const teamsRet = [];

      // iterate rosters to get team members
      const teamRosters = [];
      allRosters.forEach((team) => {
        const {
          'TEAM ID': teamId, TEAM: teamName, 'PLAYER A': playerAName, 'PLAYER B': playerBName, 'PLAYER C': playerCName,
        } = team;
        if (teamName) {
          if (playerAName && playerBName && playerCName) {
            const playerA = parseInt(allPlayers.find((player) => player.name === playerAName).id, 10);
            const playerB = parseInt(allPlayers.find((player) => player.name === playerBName).id, 10);
            const playerC = parseInt(allPlayers.find((player) => player.name === playerCName).id, 10);
            const teamMembers = [playerA, playerB, playerC];
            const roster = {
              id: parseInt(teamId, 10),
              name: teamName,
              members: teamMembers,
            };
            teamRosters.push(roster);
            // console.log(roster);
          } else if (playerAName && playerBName) {
            const playerA = parseInt(allPlayers.find((player) => player.name === playerAName).id, 10);
            const playerB = parseInt(allPlayers.find((player) => player.name === playerBName).id, 10);
            const teamMembers = [playerA, playerB];
            const roster = {
              id: parseInt(teamId, 10),
              name: teamName,
              members: teamMembers,
            };
            teamRosters.push(roster);
          }
        }
      });

      // iterate standings to get other team info (and use rosters to lookup members)
      for (let i = 0, allLen = allStandings.length; i < allLen; i++) {
        const rankedTeam = allStandings[i];
        const {
          Rank: teamRank, TEAM: rankedName, PTS: teamPts, GF: goalsFor, GA: goalsAgainst, '+/-': plusMinus, W: wins, L: losses, VALUE: teamValue,
        } = rankedTeam;
        const { id, members } = teamRosters.find((team) => team.name === rankedName);

        const teamObj = {
          id,
          name: rankedName,
          members,
          rank: teamRank,
          wins,
          losses,
          plusMinus,
          goalsFor,
          goalsAgainst,
          points: teamPts,
          value: teamValue,
          season: parseInt(SEASON_NUMBER, 10),
        };

        // console.log(chalk.cyan(JSON.stringify(teamObj)));

        teamsRet.push(teamObj);
      }
      resolve(teamsRet);
      resolve([]);
    })).catch((err) => {
      reject(err);
    });
  });
}

/**
  *  games: [{
  *    id: 1, homeTeam: 1, awayTeam: 2, gameWeek: 1, gameTime: '05/29/2020 19:30 -0500', arena: 'Salty Shores',
  *  }, ...],
  */
function getGamesFromSheets(scheduleSheet, allTeams) {
  return new Promise((resolve, reject) => {
    scheduleSheet.getRows()
      .then((allGames) => {
        // console.log('allGames', allGames);
        const gamesRet = [];
        let curArena = 'Salty Shores';
        let curGameweek = 1;
        const curSeason = parseInt(SEASON_NUMBER, 10);
        for (let i = 0, allLen = allGames.length; i < allLen; i++) {
          const gameRowA = allGames[i];
          const gameRowB = allGames[i + 1];
          const gameRowC = allGames[i + 2];
          const gameRowD = allGames[i + 3];

          if (gameRowA.Date.startsWith('Gameweek')) {
            // eslint-disable-next-line prefer-destructuring
            curGameweek = gameRowA.Date.split(' ')[1];
            continue; // eslint-disable-line
          }
          if (!gameRowA.Date) {
            continue; // eslint-disable-line
          }
          if (gameRowA.Arena) {
            curArena = gameRowA.Arena;
          }

          const {
            Date: dateA, 'Time (CT)': timeA, 'Match #': matchNum, Team: teamIdA, G1: game1ScoreA, G2: game2ScoreA,
          } = gameRowA;
          const {
            Team: teamIdB, G1: game1ScoreB, G2: game2ScoreB,
          } = gameRowB;
          const dateTime = `${dateA} ${timeA} -0500`;
          const homeTeam = allTeams.find((team) => team.id === parseInt(teamIdA, 10));
          const awayTeam = allTeams.find((team) => team.id === parseInt(teamIdB, 10));
          const homeTeamId = parseInt(homeTeam.id, 10);
          const awayTeamId = parseInt(awayTeam.id, 10);
          const game1Obj = {
            id: parseInt(matchNum, 10),
            gameTime: dateTime,
            gameWeek: curGameweek,
            arena: curArena,
            homeTeamId,
            homeTeamScoreA: game1ScoreA,
            homeTeamScoreB: game2ScoreA,
            awayTeamId,
            awayTeamScoreA: game1ScoreB,
            awayTeamScoreB: game2ScoreB,
            season: parseInt(SEASON_NUMBER, 10),
          };
          // console.log(JSON.stringify(game1Obj));
          gamesRet.push(game1Obj);

          if (curSeason > 2 && !gameRowC['Time (CT)']) {
            const {
              'Match #': matchNum2, Team: teamIdA2, G1: game1ScoreA2, G2: game2ScoreA2,
            } = gameRowC;
            const {
              Team: teamIdB2, G1: game1ScoreB2, G2: game2ScoreB2,
            } = gameRowD;
            const homeTeam2 = allTeams.find((team) => team.id === parseInt(teamIdA2, 10));
            const awayTeam2 = allTeams.find((team) => team.id === parseInt(teamIdB2, 10));
            const homeTeamId2 = parseInt(homeTeam2.id, 10);
            const awayTeamId2 = parseInt(awayTeam2.id, 10);
            const game2Obj = {
              id: parseInt(matchNum2, 10),
              gameTime: dateTime,
              gameWeek: curGameweek,
              arena: curArena,
              homeTeamId: homeTeamId2,
              homeTeamScoreA: game1ScoreA2,
              homeTeamScoreB: game2ScoreA2,
              awayTeamId: awayTeamId2,
              awayTeamScoreA: game1ScoreB2,
              awayTeamScoreB: game2ScoreB2,
              season: parseInt(SEASON_NUMBER, 10),
            };
            // console.log(JSON.stringify(game1Obj));
            gamesRet.push(game2Obj);
          }
        }
        resolve(gamesRet);
      }).catch((err) => {
        reject(err);
      });
  });
}

/* idempotent operation */
function updateDatabase(key, data) {
  console.log('Initialize the database with records!');
  const client = new faunadb.Client({
    secret: key,
  });

  const updateQueries = [];
  const insertQueries = [];
  Object.keys(data).forEach((collectionKey) => {
    console.log(chalk.cyan('Init collection', collectionKey));
    const collectionData = data[collectionKey];

    collectionData.forEach((record) => {
      updateQueries.push(q.Update(q.Select('ref', q.Get(q.Match(q.Index(`${collectionKey}_by_season_and_id`), parseInt(SEASON_NUMBER, 10), record.id))), { data: record }));
      insertQueries.push(q.Create(q.Collection(collectionKey), { data: record }));
    });
  });

  return client.query(updateQueries)
    .then(() => {
      console.log('updated existing records');
      // const recordQueries = [];
      // Object.keys(data).forEach((collectionKey) => {
      //   const collectionData = data[collectionKey];

      //   dbRecords.forEach((dbRecord) => {
      //     collectionData.some((record) => {
      //       if (dbRecord.id === record.id) { // this should be good enough b/c index only returns correct Season
      //         recordQueries.push(q.Update(q.Ref(dbRecord), { data: record }));
      //         return true; // found it - break out of the some loop
      //       }
      //       return false; // continue
      //     });
      //   });
      // });
      // return client.query(recordQueries)
      //   .catch((err) => {
      //     console.error('ERROR from recordQueries');
      //     console.log(err);
      //   });
    }).catch((e) => {
      console.error('ERROR from updateQueries');
      console.log(e);

      if (e.message === 'instance not found') {
        // responseRaw: '{"errors":[{"position":[25,"update","from"],"code":"instance not found","description":"Set not found."}, ... ]}
        const errorResponses = JSON.parse(e.requestResult.responseRaw).errors;
        const filteredInserts = [];
        errorResponses.forEach((error) => {
          filteredInserts.push(insertQueries[error.position[0]]);
        });
        // record doesn't exist yet - insert it instead of update
        return client.query(filteredInserts)
          .then(() => {
            console.log('inserted new records, re-run to update existing');
          }).catch((err) => {
            console.log('ERROR from filteredInserts');
            console.log(err);
          });
      // eslint-disable-next-line no-else-return
      } else {
        console.log(e);
        throw new Error(e);
      }
    });
}

// function updateDatabase(key, data) {
//   console.log('Initialize the database with records!');
//   const client = new faunadb.Client({
//     secret: key,
//   });

//   const lookupQueries = [];
//   Object.keys(data).forEach((collectionKey) => {
//     console.log(chalk.cyan('Init collection', collectionKey));
//     const collectionData = data[collectionKey];

//     collectionData.forEach((record) => {
//       lookupQueries.push(q.Get(q.Match(q.Index(`${collectionKey}_by_season_and_id`), parseInt(SEASON_NUMBER, 10), record.id)));
//     });
//   });

//   return client.query(lookupQueries)
//     .then((dbRecords) => {
//       const recordQueries = [];
//       Object.keys(data).forEach((collectionKey) => {
//         const collectionData = data[collectionKey];

//         dbRecords.forEach((dbRecord) => {
//           collectionData.some((record) => {
//             if (dbRecord.id === record.id) { // this should be good enough b/c index only returns correct Season
//               recordQueries.push(q.Update(q.Ref(dbRecord), { data: record }));
//               return true; // found it - break out of the some loop
//             }
//             return false; // continue
//           });
//         });
//       });
//       return client.query(recordQueries)
//         .catch((err) => {
//           console.error('ERROR from recordQueries');
//           console.log(err);
//         });
//     }).catch((err) => {
//       console.error('ERROR from lookupQueries');
//       console.log(err);
//     });
// }

/* util methods */

// Test if inside netlify build context
function insideNetlifyBuildContext() {
  if (process.env.DEPLOY_PRIME_URL) {
    return true;
  }
  return false;
}

// Readline util
function ask(question, callback) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question(`${question}\n`, (answer) => {
    rl.close();
    callback(null, answer);
  });
}
