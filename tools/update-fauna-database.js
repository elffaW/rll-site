/* eslint-disable no-console */
/* eslint-disable no-use-before-define */
/* update database in Fauna with latest spreadsheet data */
const readline = require('readline');
const faunadb = require('faunadb');
const chalk = require('chalk');

const { GoogleSpreadsheet } = require('google-spreadsheet');
require('dotenv').config();

const insideNetlify = insideNetlifyBuildContext();
const q = faunadb.query;

const {
  SEASON_NUMBER, FAUNADB_SECRET, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEETS_SHEET_ID,
} = process.env;

if (!SEASON_NUMBER) {
  console.log(chalk.yellow('Required SEASON_NUMBER environment variable not found.'));
  process.exit(1);
}

console.log(chalk.cyan('Updating your FaunaDB Database...\n'));

// 1. Check for required enviroment variables
if (!FAUNADB_SECRET) {
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
          updateDatabase(FAUNADB_SECRET, data).then(() => {
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
if (FAUNADB_SECRET) {
  // required env vars
  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL) {
    console.log(chalk.yellow('no GOOGLE_SERVICE_ACCOUNT_EMAIL env var set'));
    process.exit(1);
  }
  if (!GOOGLE_PRIVATE_KEY) {
    console.log(chalk.yellow('no GOOGLE_PRIVATE_KEY env var set'));
    process.exit(1);
  }
  if (!GOOGLE_SHEETS_SHEET_ID) {
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
        console.log('Database updated');
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
    const email = GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = GOOGLE_PRIVATE_KEY;
    const sheetId = GOOGLE_SHEETS_SHEET_ID;

    try {
      const doc = new GoogleSpreadsheet(sheetId);
      doc.useServiceAccountAuth({
        client_email: email,
        private_key: privateKey.replace(/\\n/g, '\n'),
      }).then(() => {
        doc.loadInfo().then(() => {
          /**
           * 0: Standings
           * 1: Leaderboards
           * 2: Schedule
           * 3: Playoff Bracket
           * 4: Players
           * 5: Roster
           * 6: Stats
           * 7: EXPORT
           * 8: ROLES*
           *
           * ROLES sheet removed season 4
           *
           * Lots of changes in Season 5
           * - teams of 2
           * - Standings simplified
           * - Schedule replaced by multiple other sheets (ScheduleRows important one)
           */
          // const playersSheet = doc.sheetsByIndex[4];
          // const rolesSheet = doc.sheetsByIndex[8];
          // const rostersSheet = doc.sheetsByIndex[5];
          // const standingsSheet = doc.sheetsByIndex[0];
          // const scheduleSheet = doc.sheetsByIndex[2];
          // const statsSheet = doc.sheetsByIndex[6];

          const playersSheet = doc.sheetsByTitle.Players;
          const rolesSheet = doc.sheetsByTitle.Roles;
          const rostersSheet = doc.sheetsByTitle.Roster;
          const standingsSheet = doc.sheetsByTitle.Standings;
          const scheduleSheet = doc.sheetsByTitle.ScheduleRows;
          const statsSheet = doc.sheetsByTitle.Stats;
          const gameStatsSheet = doc.sheetsByTitle.GameStats;
          // const goalStatsSheet = doc.sheetsByTitle.GoalStats;

          getStatsFromSheets(statsSheet, gameStatsSheet).then((allStats) => {
            getPlayersFromSheets(playersSheet, rolesSheet, allStats).then((players) => {
              const { playersRet: allPlayers, statsRet: statsWithPlayers } = players;
              getTeamsFromSheets(rostersSheet, standingsSheet, allPlayers).then((allTeams) => {
                getGamesFromSheets(scheduleSheet, allTeams, allStats).then((allGames) => {
                  resolve({
                    players: allPlayers,
                    teams: allTeams,
                    games: allGames,
                    stats: statsWithPlayers,
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

function getStatsFromSheets(statsSheet, gameStatsSheet) {
  return new Promise((resolve, reject) => {
    statsSheet.getRows().then((allStats) => gameStatsSheet.getRows().then((gameStats) => {
      const statsRet = {};
      const statsByGame = {};
      const statsByPlayer = {};
      const statsByTeam = {};
      const statsRows = [];
      allStats.forEach((stats) => {
        const {
          GN: gameId,
          PLAYER: playerName,
          TM: teamName,
          OPP: opposingTeam,
          'TM SC': teamGoals,
          'OPP SC': opponentGoals,
          SCORE: playerScore,
          G: playerGoals,
          A: playerAssists,
          SV: playerSaves,
          SH: playerShots,
          MVP: playerMVP,
          PTS: playerPts,
          TYPE: statsType,
          W: playerWin,
          L: playerLoss,
          'TM TOT SC': teamTotScore,
          'TM AVG SCORE': teamAvgScore,
          'TM%': playerPercentOfTeam,
          RATING: playerRatingVsTeam,
          GW: gameWeek,
          'OPP TOT SCORE': oppTotScore,
          RATIO: teamsScoreRatio,
          TOUCHES: playerBallTouches,
          'AIR TIME HIGH': playerTimeHighInAir,
          'AIR TIME LOW': playerTimeLowInAir,
          'AIR HITS': playerTotalAerials,
          DEMOS: playerNumDemosInflicted,
          'DEMOS TAKEN': playerNumDemosTaken,
          'FIRST TOUCHES': playerNumTimeFirstTouch,
          'KICKOFF AFK': playerNumTimeAfk,
          CLEARS: playerTotalClears,
          PASSES: playerTotalPasses,
          TURNOVERS: playerTurnovers,
          'TURNOVERS WON': playerTakeaways,
          'BOOST USAGE': playerBoostUsage,
          'SMALL BOOSTS': playerNumSmallBoosts,
          'LARGE BOOSTS': playerNumLargeBoosts,
          'WASTED BOOST': playerWastedUsage,
          'AVG BOOST': playerAverageBoostLevel,
          'STOLEN BOOSTS': playerNumStolenBoosts,
          'AVG SPEED': playerAverageSpeed,
          'AVG HIT DISTANCE': playerAverageHitDistance,
          'SLOW SPEED TIME': playerTimeAtSlowSpeed,
          'BOOST SPEED TIME': playerTimeAtBoostSpeed,
          'SUPERSONIC TIME': playerTimeAtSuperSonic,
          'BALLCAM TIME': playerTimeBallcam,
          'TIME ON WALL': playerTimeOnWall,
          'TIME MOST FORWARD': playerTimeMostForwardPlayer,
          'TIME MOST BACK': playerTimeMostBackPlayer,
          'TIME BETWEEN': playerTimeBetweenPlayers,
          'TIME BEHIND BALL': playerTimeBehindBall,
          'TIME IN FRONT BALL': playerTimeInFrontBall,
          'BALL HIT FORWARD': playerBallHitForwardDist,
          'BALL HIT BACKWARD': playerBallHitBackwardDist,
          'TIME CLOSE TO BALL': playerTimeCloseToBall,
          'BALL CARRIES': playerTotalCarries,
          'CARRY DISTANCE': playerTotalCarryDistance,
          'DRIBBLE HITS': playerTotalDribbles,
          'TIME CLUMPED': teamTimeClumped,
          'USEFUL HITS': playerUsefulHits,
          'TIME IN GAME': playerTimeInGame,
          'TIME DEF THIRD': playerTimeInDefendingThird,
          'TIME NEUTRAL THIRD': playerTimeInNeutralThird,
          'TIME ATTACK THIRD': playerTimeInAttackingThird,
          'GAME ID': gameName,
        } = stats;
        statsRows.push({
          id: `${gameId}-${playerName}-${SEASON_NUMBER}`,
          gameId,
          gameName,
          playerName,
          season: parseInt(SEASON_NUMBER, 10),
          gameWeek: parseInt(gameWeek, 10),
          teamName,
          opposingTeam,
          teamGoals,
          opponentGoals,
          gameResult: playerWin ? 'W' : 'L',
          playerScore,
          playerGoals,
          playerAssists,
          playerSaves,
          playerShots,
          playerMVP,
          playerPts,
          statsType,
          playerWin,
          playerLoss,
          teamTotScore,
          teamAvgScore,
          playerPercentOfTeam,
          playerRatingVsTeam,
          oppTotScore,
          teamsScoreRatio,
          playerBallTouches,
          playerTimeHighInAir,
          playerTimeLowInAir,
          playerTotalAerials,
          playerNumDemosInflicted,
          playerNumDemosTaken,
          playerNumTimeFirstTouch,
          playerNumTimeAfk,
          playerTotalClears,
          playerTotalPasses,
          playerTurnovers,
          playerTakeaways,
          playerBoostUsage,
          playerNumSmallBoosts,
          playerNumLargeBoosts,
          playerWastedUsage,
          playerAverageBoostLevel,
          playerNumStolenBoosts,
          playerAverageSpeed,
          playerAverageHitDistance,
          playerTimeAtSlowSpeed,
          playerTimeAtBoostSpeed,
          playerTimeAtSuperSonic,
          playerTimeBallcam,
          playerTimeOnWall,
          playerTimeMostForwardPlayer,
          playerTimeMostBackPlayer,
          playerTimeBetweenPlayers,
          playerTimeBehindBall,
          playerTimeInFrontBall,
          playerBallHitForwardDist,
          playerBallHitBackwardDist,
          playerTimeCloseToBall,
          playerTotalCarries,
          playerTotalCarryDistance,
          playerTotalDribbles,
          teamTimeClumped,
          playerUsefulHits,
          playerTimeInGame,
          playerTimeInDefendingThird,
          playerTimeInNeutralThird,
          playerTimeInAttackingThird,
        });
        if (playerName) {
          // statsType: RS, PO, SUB, BOT, COMB (combine), SN (Seed Night)
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
                wins: parseInt(playerWin, 10) || 0,
                losses: parseInt(playerLoss, 10) || 0,
                scorePercentOfTeam: parseFloat(playerPercentOfTeam) || 0,
                scoreRatingVsTeam: parseFloat(playerRatingVsTeam) || 0,
                ballTouches: parseInt(playerBallTouches, 10) || 0,
                timeHighInAir: parseFloat(playerTimeHighInAir) || 0,
                timeLowInAir: parseFloat(playerTimeLowInAir) || 0,
                totalAerials: parseInt(playerTotalAerials, 10) || 0,
                numDemosInflicted: parseInt(playerNumDemosInflicted, 10) || 0,
                numDemosTaken: parseInt(playerNumDemosTaken, 10) || 0,
                numKickoffFirstTouch: parseInt(playerNumTimeFirstTouch, 10) || 0,
                numKickoffAfk: parseInt(playerNumTimeAfk, 10) || 0,
                totalClears: parseInt(playerTotalClears, 10) || 0,
                totalPasses: parseInt(playerTotalPasses, 10) || 0,
                turnovers: parseInt(playerTurnovers, 10) || 0,
                takeaways: parseInt(playerTakeaways, 10) || 0,
                boostUsage: parseFloat(playerBoostUsage) || 0,
                numSmallBoosts: parseInt(playerNumSmallBoosts, 10) || 0,
                numLargeBoosts: parseInt(playerNumLargeBoosts, 10) || 0,
                wastedUsage: parseFloat(playerWastedUsage) || 0,
                averageBoostLevel: parseFloat(playerAverageBoostLevel) || 0,
                numStolenBoosts: parseInt(playerNumStolenBoosts, 10) || 0,
                averageSpeed: parseFloat(playerAverageSpeed) || 0,
                averageHitDistance: parseFloat(playerAverageHitDistance) || 0,
                timeAtSlowSpeed: parseFloat(playerTimeAtSlowSpeed) || 0,
                timeAtBoostSpeed: parseFloat(playerTimeAtBoostSpeed) || 0,
                timeAtSuperSonic: parseFloat(playerTimeAtSuperSonic) || 0,
                timeBallcam: parseFloat(playerTimeBallcam) || 0,
                timeOnWall: parseFloat(playerTimeOnWall) || 0,
                timeMostForwardPlayer: parseFloat(playerTimeMostForwardPlayer) || 0,
                timeMostBackPlayer: parseFloat(playerTimeMostBackPlayer) || 0,
                timeBetweenPlayers: parseFloat(playerTimeBetweenPlayers) || 0,
                timeBehindBall: parseFloat(playerTimeBehindBall) || 0,
                timeInFrontBall: parseFloat(playerTimeInFrontBall) || 0,
                ballHitForwardDist: parseFloat(playerBallHitForwardDist) || 0,
                ballHitBackwardDist: parseFloat(playerBallHitBackwardDist) || 0,
                timeCloseToBall: parseFloat(playerTimeCloseToBall) || 0,
                totalCarries: parseInt(playerTotalCarries, 10) || 0,
                totalCarryDistance: parseFloat(playerTotalCarryDistance) || 0,
                totalDribbles: parseInt(playerTotalDribbles, 10) || 0,
                usefulHits: parseInt(playerUsefulHits, 10) || 0,
                timeInGame: parseFloat(playerTimeInGame) || 0,
                timeInDefendingThird: parseFloat(playerTimeInDefendingThird) || 0,
                timeInNeutralThird: parseFloat(playerTimeInNeutralThird) || 0,
                timeInAttackingThird: parseFloat(playerTimeInAttackingThird) || 0,
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
              statsByPlayer[playerName].wins += parseInt(playerWin, 10);
              statsByPlayer[playerName].losses += parseInt(playerLoss, 10);
              statsByPlayer[playerName].scorePercentOfTeam += (parseFloat(playerPercentOfTeam) || 0);
              statsByPlayer[playerName].scoreRatingVsTeam += (parseFloat(playerRatingVsTeam) || 0);
              statsByPlayer[playerName].ballTouches += (parseInt(playerBallTouches, 10) || 0);
              statsByPlayer[playerName].timeHighInAir += (parseFloat(playerTimeHighInAir) || 0);
              statsByPlayer[playerName].timeLowInAir += (parseFloat(playerTimeLowInAir) || 0);
              statsByPlayer[playerName].totalAerials += (parseInt(playerTotalAerials, 10) || 0);
              statsByPlayer[playerName].numDemosInflicted += (parseInt(playerNumDemosInflicted, 10) || 0);
              statsByPlayer[playerName].numDemosTaken += (parseInt(playerNumDemosTaken, 10) || 0);
              statsByPlayer[playerName].numKickoffFirstTouch += (parseInt(playerNumTimeFirstTouch, 10) || 0);
              statsByPlayer[playerName].numKickoffAfk += (parseInt(playerNumTimeAfk, 10) || 0);
              statsByPlayer[playerName].totalClears += (parseInt(playerTotalClears, 10) || 0);
              statsByPlayer[playerName].totalPasses += (parseInt(playerTotalPasses, 10) || 0);
              statsByPlayer[playerName].turnovers += (parseInt(playerTurnovers, 10) || 0);
              statsByPlayer[playerName].takeaways += (parseInt(playerTakeaways, 10) || 0);
              statsByPlayer[playerName].boostUsage += (parseFloat(playerBoostUsage) || 0);
              statsByPlayer[playerName].numSmallBoosts += (parseInt(playerNumSmallBoosts, 10) || 0);
              statsByPlayer[playerName].numLargeBoosts += (parseInt(playerNumLargeBoosts, 10) || 0);
              statsByPlayer[playerName].wastedUsage += (parseFloat(playerWastedUsage) || 0);
              statsByPlayer[playerName].averageBoostLevel += (parseFloat(playerAverageBoostLevel) || 0);
              statsByPlayer[playerName].numStolenBoosts += (parseInt(playerNumStolenBoosts, 10) || 0);
              statsByPlayer[playerName].averageSpeed += (parseFloat(playerAverageSpeed) || 0);
              statsByPlayer[playerName].averageHitDistance += (parseFloat(playerAverageHitDistance) || 0);
              statsByPlayer[playerName].timeAtSlowSpeed += (parseFloat(playerTimeAtSlowSpeed) || 0);
              statsByPlayer[playerName].timeAtBoostSpeed += (parseFloat(playerTimeAtBoostSpeed) || 0);
              statsByPlayer[playerName].timeAtSuperSonic += (parseFloat(playerTimeAtSuperSonic) || 0);
              statsByPlayer[playerName].timeBallcam += (parseFloat(playerTimeBallcam) || 0);
              statsByPlayer[playerName].timeOnWall += (parseFloat(playerTimeOnWall) || 0);
              statsByPlayer[playerName].timeMostForwardPlayer += (parseFloat(playerTimeMostForwardPlayer) || 0);
              statsByPlayer[playerName].timeMostBackPlayer += (parseFloat(playerTimeMostBackPlayer) || 0);
              statsByPlayer[playerName].timeBetweenPlayers += (parseFloat(playerTimeBetweenPlayers) || 0);
              statsByPlayer[playerName].timeBehindBall += (parseFloat(playerTimeBehindBall) || 0);
              statsByPlayer[playerName].timeInFrontBall += (parseFloat(playerTimeInFrontBall) || 0);
              statsByPlayer[playerName].ballHitForwardDist += (parseFloat(playerBallHitForwardDist) || 0);
              statsByPlayer[playerName].ballHitBackwardDist += (parseFloat(playerBallHitBackwardDist) || 0);
              statsByPlayer[playerName].timeCloseToBall += (parseFloat(playerTimeCloseToBall) || 0);
              statsByPlayer[playerName].totalCarries += (parseInt(playerTotalCarries, 10) || 0);
              statsByPlayer[playerName].totalCarryDistance += (parseFloat(playerTotalCarryDistance) || 0);
              statsByPlayer[playerName].totalDribbles += (parseInt(playerTotalDribbles, 10) || 0);
              statsByPlayer[playerName].usefulHits += (parseInt(playerUsefulHits, 10) || 0);
              statsByPlayer[playerName].timeInGame += (parseFloat(playerTimeInGame) || 0);
              statsByPlayer[playerName].timeInDefendingThird += (parseFloat(playerTimeInDefendingThird) || 0);
              statsByPlayer[playerName].timeInNeutralThird += (parseFloat(playerTimeInNeutralThird) || 0);
              statsByPlayer[playerName].timeInAttackingThird += (parseFloat(playerTimeInAttackingThird) || 0);
            }
            if (!statsByGame[gameId]) {
              const curGameStats = gameStats.find((g) => g.gameId === gameName);
              const {
                avgBallSpeed,
                neutralPossessionTime,
                totalAerials,
                winningTeam: winningTeamName,
                losingTeam: losingTeamName,
                startTime,
                gameLength,
                map,
                probablyOT,
                serverRegion,
              } = curGameStats || {};
              statsByGame[gameId] = {
                id: gameId,
                gameName,
                team0: teamName,
                team1: opposingTeam,
                team0Goals: parseInt(teamGoals, 10),
                team1Goals: parseInt(opponentGoals, 10),
                team0Score: parseInt(teamTotScore, 10),
                team0AvgScore: parseFloat(teamAvgScore),
                team1Score: parseInt(oppTotScore, 10),
                team0to1ScoreRatio: parseFloat(teamsScoreRatio),
                avgBallSpeed: parseFloat(avgBallSpeed),
                neutralPossessionTime: parseFloat(neutralPossessionTime),
                totalAerials: parseInt(totalAerials, 10),
                winningTeamName,
                losingTeamName,
                startTime: parseFloat(startTime),
                gameLength: parseFloat(gameLength),
                map,
                probablyOT: probablyOT && probablyOT === 'TRUE',
                serverRegion,
              };
            }
            if (!statsByTeam[teamName]) {
              statsByTeam[teamName] = {
                gamesPlayed: 1,
                teamName,
                goals: parseInt(teamGoals, 10),
                goalsAllowed: parseInt(opponentGoals, 10),
                score: parseInt(teamTotScore, 10),
                avgScore: parseFloat(teamAvgScore),
                timeClumped: parseFloat(teamTimeClumped) || 0,
              };
            } else {
              statsByTeam[teamName].gamesPlayed += 1;
              statsByTeam[teamName].goals += parseInt(teamGoals, 10);
              statsByTeam[teamName].goalsAllowed += parseInt(opponentGoals, 10);
              statsByTeam[teamName].score += parseInt(teamTotScore, 10);
              statsByTeam[teamName].avgScore += parseFloat(teamAvgScore);
              statsByTeam[teamName].avgScore /= statsByTeam[teamName].gamesPlayed;

              statsByTeam[teamName].timeClumped += parseFloat(teamTimeClumped) || 0;
            }
          }
        }
      });
      statsRet.statsByPlayer = statsByPlayer;
      statsRet.statsByGame = statsByGame;
      statsRet.statsByTeam = statsByTeam;
      statsRet.statsRows = statsRows;
      console.log(`Got ${Object.keys(statsRet.statsByPlayer).length} PLAYER stats records from Stats`);
      console.log(`Got ${Object.keys(statsRet.statsByGame).length} GAME   stats records from Stats`);
      console.log(`Got ${Object.keys(statsRet.statsByTeam).length} TEAM   stats records from Stats`);
      console.log(`Got ${statsRet.statsRows.length} INDIV   stats records from Stats`);
      resolve(statsRet);
    })).catch((err) => {
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
    const playersRet = [];
    const statsRet = [];
    if (SEASON_NUMBER < 4) {
      playersSheet.getRows().then((allPlayers) => rolesSheet.getRows().then((allRoles) => {
        const playerRoles = [];
        allRoles.forEach((role) => {
          const { PLAYER: playerName, 'ROLE PRIMARY': primaryRole, 'ROLE SECONDARY': secondaryRole } = role;
          playerRoles.push({ playerName, primaryRole, secondaryRole });
        });

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
            score,
            goals,
            assists,
            saves,
            shots,
            numMVP,
            points,
            gamesPlayed,
            name: capsName, // we don't use this, but without it `otherStats` will overwrite the name we want
            ...otherStats
          } = allStats.statsByPlayer[name.toUpperCase()];
          console.log(name);
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
            ...otherStats,
            value,
            system,
            country,
            position,
            season: parseInt(SEASON_NUMBER, 10),
          };
          playersRet.push(playerObj);

          allStats.statsRows.forEach((row) => {
            const { ...tempRow } = row;
            if (row.playerName.toUpperCase() === name.toUpperCase() && row.season === parseInt(SEASON_NUMBER, 10)) {
              tempRow.player = parseInt(id, 10);
              statsRet.push(tempRow);
            }
          });
        });
        console.log(`Got ${playersRet.length} players from Players`);
        console.log(`Updated ${statsRet.length} stats with Players`);
        resolve({ playersRet, statsRet });
      })).catch((err) => {
        reject(err);
      });
    } else { // SEASON 4 removed roles sheet
      playersSheet.getRows().then((allPlayers) => {
        allPlayers.forEach((player) => {
          if (player.ID && player.Name) {
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
            const {
              score = 0,
              goals = 0,
              assists = 0,
              saves = 0,
              shots = 0,
              numMVP = 0,
              points = 0,
              gamesPlayed = 0,
              name: capsName, // we don't use this, but without it `otherStats` will overwrite the name we want
              ...otherStats
            } = allStats.statsByPlayer[name.toUpperCase()] || {};
            const playerObj = {
              id: parseInt(id, 10),
              name,
              rlName,
              team,
              car,
              signingValue,
              score,
              goals,
              assists,
              saves,
              shots,
              numMVP,
              points,
              gamesPlayed,
              ...otherStats,
              value,
              system,
              country,
              position,
              season: parseInt(SEASON_NUMBER, 10),
            };
            playersRet.push(playerObj);

            allStats.statsRows.forEach((row) => {
              const { ...tempRow } = row;
              if (row.playerName.toUpperCase() === name.toUpperCase() && row.season === parseInt(SEASON_NUMBER, 10)) {
                tempRow.player = parseInt(id, 10);
                statsRet.push(tempRow);
              }
            });
          }
        });
        console.log(`Got ${playersRet.length} players from Players`);
        console.log(`Updated ${statsRet.length} stats with Players`);
        resolve({ playersRet, statsRet });
      }).catch((err) => {
        reject(err);
      });
    }
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
            console.log('\t', teamName, ':\t ', playerAName, playerBName, playerCName);

            // get player A ID and value
            const playerAFull = allPlayers.find(
              (player) => player.name.toUpperCase() === playerAName.toUpperCase(),
            );
            const playerA = parseInt(playerAFull.id, 10);
            const playerAValue = parseFloat(playerAFull.value);

            // get player B ID and value
            const playerBFull = allPlayers.find(
              (player) => player.name.toUpperCase() === playerBName.toUpperCase(),
            );
            const playerB = parseInt(playerBFull.id, 10);
            const playerBValue = parseFloat(playerBFull.value);

            // get player C ID and value
            const playerCFull = allPlayers.find(
              (player) => player.name.toUpperCase() === playerCName.toUpperCase(),
            );
            const playerC = parseInt(playerCFull.id, 10);
            const playerCValue = parseFloat(playerCFull.value);

            const teamMembers = [playerA, playerB, playerC];
            const roster = {
              id: parseInt(teamId, 10),
              name: teamName,
              members: teamMembers,
              totalValue: (playerAValue + playerBValue + playerCValue).toFixed(1),
            };
            teamRosters.push(roster);
          } else if (playerAName && playerBName) {
            console.log('\t', teamName, ':\t ', playerAName, playerBName);

            const playerAFull = allPlayers.find(
              (player) => player.name.toUpperCase() === playerAName.toUpperCase(),
            );
            const playerA = parseInt(playerAFull.id, 10);
            const playerAValue = parseFloat(playerAFull.value);
            const playerBFull = allPlayers.find(
              (player) => player.name.toUpperCase() === playerBName.toUpperCase(),
            );
            const playerB = parseInt(playerBFull.id, 10);
            const playerBValue = parseFloat(playerBFull.value);
            const teamMembers = [playerA, playerB];
            const roster = {
              id: parseInt(teamId, 10),
              name: teamName,
              members: teamMembers,
              totalValue: (playerAValue + playerBValue).toFixed(1),
            };
            teamRosters.push(roster);
          }
        }
      });

      // iterate standings to get other team info (and use rosters to lookup members)
      for (let i = 0, allLen = allStandings.length; i < allLen; i++) {
        const rankedTeam = allStandings[i];
        const {
          Rank,
          RANK: teamRank,
          TEAM: rankedName,
          PTS: teamPts,
          DONG: teamDong,
          'CURRENT DIVISION ID': curDivision = 1,
          GF: goalsFor,
          GA: goalsAgainst,
          '+/-': plusMinus,
          W: wins = 0,
          WINS = 0,
          L: losses = 0,
          LOSSES = 0,
          VALUE: teamValue = 0,
          SOs: shutouts,
          'SHUT OUTS': teamShutouts,
        } = rankedTeam;
        if (rankedName && teamRank) {
          const { id, members, totalValue } = teamRosters.find((team) => team.name === rankedName);

          // do some stupid fixing in case of different header names (from one season to another)
          let finalPts = teamPts;
          if (!teamPts) {
            finalPts = teamDong;
          }
          let finalRank = teamRank;
          if (!teamRank) {
            finalRank = Rank;
          }
          let finalWins = wins;
          if (!wins) {
            finalWins = WINS;
          }
          let finalLosses = losses;
          if (!losses) {
            finalLosses = LOSSES;
          }
          let finalShutouts = shutouts;
          if (!wins) {
            finalShutouts = teamShutouts;
          }
          let finalValue = teamValue;
          if (teamValue <= 0) {
            finalValue = totalValue;
          }

          const teamObj = {
            id,
            name: rankedName,
            curDivision,
            members,
            rank: finalRank,
            wins: finalWins,
            losses: finalLosses || 0,
            plusMinus,
            goalsFor,
            goalsAgainst: goalsAgainst || 0,
            points: finalPts,
            value: finalValue,
            shutouts: finalShutouts,
            season: parseInt(SEASON_NUMBER, 10),
          };

          // console.log(chalk.cyan(JSON.stringify(teamObj)));

          teamsRet.push(teamObj);
        }
      }
      console.log(`Got ${teamsRet.length} teams from Rosters`);
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
function getGamesFromSheets(scheduleSheet, allTeams, allStats) {
  return new Promise((resolve, reject) => {
    scheduleSheet.getRows()
      .then((allGames) => {
        const { statsByGame } = allStats;
        const gamesRet = [];
        let curArena = 'Salty Shores';
        let curGameweek = 1;
        const curSeason = parseInt(SEASON_NUMBER, 10);
        // starting Season 5 we added the ScheduleRows sheet, which made the Schedule more DB-like
        if (curSeason > 4) {
          for (let i = 0, allLen = allGames.length; i < allLen; i++) {
            const curGame = allGames[i];

            const {
              DATE: gameDate,
              'TIME CST': gameTime,
              'TIME CT': gameTimeAlt,
              TYPE: type,
              ARENA: arena,
              GAMEWEEK: gameWeek,
              MATCH: matchNum,
              GAME: gameNum,
              ROOM: streamRoom,
              LEAGUE: curDivision,
              TM_A: teamNameA,
              TM_A_ID: teamIdA,
              TM_A_RNK: teamRankA,
              TM_A_SCR: teamScoreA,
              TM_B_ID: teamIdB,
              TM_B_RNK: teamRankB,
              TM_B: teamNameB,
              TM_B_SCR: teamScoreB,
            } = curGame;

            const curGameStats = statsByGame[gameNum] || {};
            const {
              id,
              team0,
              team1,
              team0Goals,
              team1Goals,
              team0Score,
              team0AvgScore,
              team1Score,
              team0to1ScoreRatio,
              ...otherGameStats
            } = curGameStats;

            const dateTime = `${gameDate} ${gameTime || gameTimeAlt} -0500`;

            // for S5 we switch from match-based records to game-based records with matchNum specified to link
            const gameObj = {
              id: parseInt(gameNum, 10),
              gameTime: dateTime,
              type,
              arena,
              gameWeek,
              matchNum,
              gameNum,
              streamRoom,
              curDivision,
              homeTeamName: teamNameA,
              homeTeamId: parseInt(teamIdA, 10),
              homeTeamRank: teamRankA,
              homeTeamScore: teamScoreA,
              awayTeamId: parseInt(teamIdB, 10),
              awayTeamRank: teamRankB,
              awayTeamName: teamNameB,
              awayTeamScore: teamScoreB,
              ...otherGameStats,
              season: curSeason,
            };
            gamesRet.push(gameObj);
          }
        } else {
          for (let i = 0, allLen = allGames.length; i < allLen; i++) {
            const gameRowA = allGames[i];
            const gameRowB = allGames[i + 1];
            const gameRowC = allGames[i + 2];
            const gameRowD = allGames[i + 3];

            if (!gameRowA.Date) {
              continue; // eslint-disable-line
            }
            if (gameRowA.Date.startsWith('Gameweek')) {
              // eslint-disable-next-line prefer-destructuring
              curGameweek = gameRowA.Date.split(' ')[1];
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
            gamesRet.push(game1Obj);

            // after season 2 we did 2 games at a time so the schedule sheet changed
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
              gamesRet.push(game2Obj);
            }
          }
        }
        console.log(`Got ${gamesRet.length} games from Schedule`);
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

    console.log('collectionData exists for key', collectionKey, !!collectionData);

    collectionData.forEach((record) => {
      updateQueries.push(q.Update(q.Select('ref', q.Get(q.Match(q.Index(`${collectionKey}_by_season_and_id`), parseInt(SEASON_NUMBER, 10), record.id))), { data: record }));
      insertQueries.push(q.Create(q.Collection(collectionKey), { data: record }));
    });
  });

  console.log('number of insert queries: ', insertQueries.length);

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
