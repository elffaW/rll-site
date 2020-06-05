/**
 * API methods to call netlify functions
 */

const getAllPlayers = () => fetch('/.netlify/functions/players-getAll').then((response) => response.json());

const getAllTeams = () => fetch('/.netlify/functions/teams-getAll').then((response) => response.json());

const getAllGames = () => fetch('/.netlify/functions/games-getAll').then((response) => response.json());

export default {
  getAllPlayers,
  getAllTeams,
  getAllGames,
};
