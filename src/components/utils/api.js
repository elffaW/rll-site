/**
 * API methods to call netlify functions
 *
 * Needs corresponding netlify function in /api dir
 */

const getAllPlayers = () => fetch('/.netlify/functions/players-getAll').then((response) => response.json());

const getAllTeams = () => fetch('/.netlify/functions/teams-getAll').then((response) => response.json());

const getAllGames = () => fetch('/.netlify/functions/games-getAll').then((response) => response.json());

const getPlayersBySeason = (season) => fetch(`/.netlify/functions/players-getBySeason?season=${season}`).then((response) => response.json());

const getTeamsBySeason = (season) => fetch(`/.netlify/functions/teams-getBySeason?season=${season}`).then((response) => response.json());

const getGamesBySeason = (season) => fetch(`/.netlify/functions/games-getBySeason?season=${season}`).then((response) => response.json());

const getStatsBySeason = (season) => fetch(`/.netlify/functions/stats-getBySeason?season=${season}`).then((response) => response.json());

const getStatsBySeasonAndPlayer = (season, player) => fetch(`/.netlify/functions/stats-getBySeasonAndPlayer?season=${season}&player=${player}`)
  .then((response) => response.json());

const getStatsBySeasonAndGame = (season, game) => fetch(`/.netlify/functions/stats-getBySeasonAndGame?season=${season}&game=${game}`)
  .then((response) => response.json());

const getStatsByPlayerName = (player) => fetch(`/.netlify/functions/stats-getByPlayerName?player=${player}`)
  .then((response) => response.json());

export default {
  getAllPlayers,
  getAllTeams,
  getAllGames,
  getPlayersBySeason,
  getTeamsBySeason,
  getGamesBySeason,
  getStatsBySeason,
  getStatsBySeasonAndPlayer,
  getStatsBySeasonAndGame,
  getStatsByPlayerName,
};
