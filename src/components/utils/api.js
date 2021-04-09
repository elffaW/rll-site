/**
 * API methods to call netlify functions
 *
 * Needs corresponding netlify function in /api dir
 */
import memoize from 'memoizee';

const getAllPlayers = memoize(() => fetch('/.netlify/functions/players-getAll').then((response) => response.json()), { promise: true });

const getAllTeams = memoize(() => fetch('/.netlify/functions/teams-getAll').then((response) => response.json()), { promise: true });

const getAllGames = memoize(() => fetch('/.netlify/functions/games-getAll').then((response) => response.json()), { promise: true });

const getAllStats = memoize(() => fetch('/.netlify/functions/stats-getAll').then((response) => response.json()), { promise: true });

const getAllGoals = memoize(() => fetch('/.netlify/functions/goals-getAll').then((response) => response.json()), { promise: true });

const getPlayersBySeason = memoize((season) => fetch(`/.netlify/functions/players-getBySeason?season=${season}`).then((response) => response.json()), { promise: true });

const getPlayerByName = memoize((player) => fetch(`/.netlify/functions/players-getByName?player=${player}`).then((response) => response.json()), { promise: true });

const getTeamsBySeason = memoize((season) => fetch(`/.netlify/functions/teams-getBySeason?season=${season}`).then((response) => response.json()), { promise: true });

const getGamesBySeason = memoize((season) => fetch(`/.netlify/functions/games-getBySeason?season=${season}`).then((response) => response.json()), { promise: true });

const getGoalsBySeason = memoize((season) => fetch(`/.netlify/functions/goals-getBySeason?season=${season}`).then((response) => response.json()), { promise: true });

const getStatsBySeason = memoize((season) => fetch(`/.netlify/functions/stats-getBySeason?season=${season}`).then((response) => response.json()), { promise: true });

const getStatsBySeasonAndPlayer = memoize((season, player) => fetch(`/.netlify/functions/stats-getBySeasonAndPlayer?season=${season}&player=${player}`)
  .then((response) => response.json()), { promise: true });

const getStatsBySeasonAndGame = memoize((season, game) => fetch(`/.netlify/functions/stats-getBySeasonAndGame?season=${season}&game=${game}`)
  .then((response) => response.json()), { promise: true });

const getStatsByPlayerName = memoize((player) => fetch(`/.netlify/functions/stats-getByPlayerName?player=${player}`)
  .then((response) => response.json()), { promise: true });

const getAllSeasons = memoize(() => fetch('/.netlify/functions/seasons-getAll').then((response) => response.json()), { promise: true });

const getBallSpeedsBySeason = memoize((season) => fetch(`/.netlify/functions/ballspeeds-getBySeason?season=${season}`).then((response) => response.json()), { promise: true });

const getNeutPossBySeason = memoize((season) => fetch(`/.netlify/functions/neutralPoss-getBySeason?season=${season}`).then((response) => response.json()), { promise: true });

const getAerialsBySeason = memoize((season) => fetch(`/.netlify/functions/totalAerials-getBySeason?season=${season}`).then((response) => response.json()), { promise: true });

export default {
  getAllPlayers,
  getAllTeams,
  getAllGames,
  getAllStats,
  getPlayersBySeason,
  getPlayerByName,
  getTeamsBySeason,
  getGamesBySeason,
  getStatsBySeason,
  getStatsBySeasonAndPlayer,
  getStatsBySeasonAndGame,
  getStatsByPlayerName,
  getAllSeasons,
  getBallSpeedsBySeason,
  getNeutPossBySeason,
  getAerialsBySeason,
  getAllGoals,
  getGoalsBySeason,
};
