/* eslint-disable import/prefer-default-export */

/**
 * convertGamesToMatches takes array of Game objects and converts to Matches
 * @param {Game[]} games array of games (should be single season to avoid a mix of old and new game objects)
 * @returns {Match[]} array of matches with games sub-array
 *
 * @example GAME OBJECT S5
 * ```
    {
      "id": 84,
      "gameTime": "1/22/2021 9:30 PM -0500",
      "type": "RS",
      "arena": "WASTELAND",
      "gameWeek": "2",
      "matchNum": "65",
      "gameNum": "84",
      "streamRoom": "GONGSHOW2",
      "curDivision": "2",
      "homeTeamId": 1,
      "homeTeamName": "",
      "homeTeamRank": "7",
      "homeTeamScore": "",
      "awayTeamId": 2,
      "awayTeamRank": "8",
      "awayTeamName": "",
      "awayTeamScore": "",
      "season": 5
    }
   ```

   @example MATCH OBJECT
   ```
    {
      "id": parseInt(matchNum, 10),
      "gameTime": "1/22/2021 9:30 PM -0500",
      "type": "RS",
      "arena": "WASTELAND",
      "gameWeek": "2",
      "matchNum": "65",
      "games": [{
        "gameNum": "84",
        "homeTeamScore": "2",
        "awayTeamScore": "1",
        "homeWin": true,
        "gameComplete": true,
      }, {
        "gameNum": "85",
        "homeTeamScore": "1",
        "awayTeamScore": "3",
        "homeWin": false,
        "gameComplete": true,
      }],
      "streamRoom": "GONGSHOW2",
      "curDivision": "2",
      "homeTeamId": 1,
      "homeTeamName": "TEAM1",
      "homeTeamRank": "7",
      "awayTeamId": 2,
      "awayTeamRank": "8",
      "awayTeamName": "TEAM2",
      "matchComplete": true,
      "matchResult": "W",
      "season": 5
    }
  ```
 * SUMMARY OF CHANGES (vs S5 Game object):
 * - change "id" to matchNum (int)
 * - add "games" field (array of objects)
 * - - each will contain gameNum, scores, "homeWin" bool, "gameComplete" bool
 * - add "matchComplete" bool
 * - add "matchResult" string: either W, D, L depending on home team result
 */
const convertGamesToMatches = (games) => {
  if (games.length < 1 || !games) {
    return [];
  }
  // this should detect pre-S5 formatting (i.e., already match-based)
  if (games[0].homeTeamScoreA !== undefined) {
    return games;
  }

  const matches = games.reduce((rv, x) => {
    // eslint-disable-next-line no-param-reassign
    (rv[x.matchNum] = rv[x.matchNum] || []).push(x);
    return rv;
  }, {});

  const completedMatches = [];
  Object.keys(matches).forEach((matchId) => {
    const match = matches[matchId];
    const firstGame = match[0];
    const {
      id, gameNum, matchNum, homeTeamScore: tempHome, awayTeamScore: tempAway, ...otherGameInfo
    } = firstGame;
    let numHomeWins = 0;
    let numCompleteGames = 0;
    match.sort((a, b) => a.gameNum - b.gameNum);
    const matchGames = match.map((game) => {
      const { homeTeamScore, awayTeamScore, playerStats } = game;
      const gameComplete = !!homeTeamScore && !!awayTeamScore;
      numCompleteGames += +gameComplete; // convert bool to int and add to number of games
      const homeWin = parseInt(homeTeamScore, 10) > parseInt(awayTeamScore, 10);
      numHomeWins += +homeWin; // convert bool to int and add to number of wins
      return {
        gameNum,
        homeTeamScore,
        awayTeamScore,
        homeWin,
        gameComplete,
        playerStats,
      };
    });
    const numGames = matchGames.length;
    const homeWinOverall = numHomeWins > (numGames / 2);
    // eslint-disable-next-line no-nested-ternary
    const matchResult = numCompleteGames === numGames ? (homeWinOverall ? 'W' : (numHomeWins === (numGames / 2)) ? 'D' : 'L') : '-';
    completedMatches.push({
      id: parseInt(matchNum, 10),
      matchNum,
      ...otherGameInfo,
      matchResult,
      games: matchGames,
      matchComplete: numCompleteGames === numGames,
    });
  });

  return completedMatches;
};

export { convertGamesToMatches };
