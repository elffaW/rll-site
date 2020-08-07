/**
 * API methods to call netlify functions
 */

const getAllPlayers = () => fetch('/.netlify/functions/players-getAll').then((response) => response.json());

const getAllTeams = () => fetch('/.netlify/functions/teams-getAll').then((response) => response.json());

const getAllGames = () => fetch('/.netlify/functions/games-getAll').then((response) => response.json());

const getPlayersBySeason = (season) => fetch(`/.netlify/functions/players-getBySeason?season=${season}`).then((response) => response.json());

const getTeamsBySeason = (season) => fetch(`/.netlify/functions/teams-getBySeason?season=${season}`).then((response) => response.json());

const getGamesBySeason = (season) => fetch(`/.netlify/functions/games-getBySeason?season=${season}`).then((response) => response.json());

export default {
  getAllPlayers,
  getAllTeams,
  getAllGames,
  getPlayersBySeason,
  getTeamsBySeason,
  getGamesBySeason,
};
