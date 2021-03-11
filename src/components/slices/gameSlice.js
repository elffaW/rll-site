import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../utils/api';

const initialState = {
  games: [],
  currentGame: null,
  status: 'idle', // 'idle' | 'loading' | 'success' | 'failed'
  error: null, // string | null
};

export const fetchGames = createAsyncThunk('games/fetchGames', async () => {
  const response = await api.getAllGames();
  return response.map((s) => s.data);
});

/* eslint-disable no-param-reassign */
export const gameSlice = createSlice({
  name: 'games',
  initialState,
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
    updateGame: (state, action) => {
      // action.payload should be the int ID of the new game
      state.currentGame = state.games.find((s) => s.id === action.payload);
    },
  },
  extraReducers: {
    [fetchGames.pending]: (state) => {
      state.status = 'loading';
    },
    [fetchGames.fulfilled]: (state, action) => {
      state.status = 'success';
      state.games = state.games.concat(action.payload);
      state.currentGame = state.games[state.games.length - 1]; // go to most recent game by default
    },
    [fetchGames.rejected]: (state, action) => {
      state.status = 'failed';
      state.error = action.error.message;
    },
  },
});
/* eslint-enable no-param-reassign */

export const { updateGame } = gameSlice.actions;

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched
export const updateGameAsync = (gameNum) => (
  dispatch,
) => {
  setTimeout(() => {
    dispatch(updateGame(gameNum));
  }, 1000);
};

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.game.value)`
export const selectCurrentGame = (state) => state.games.currentGame;
export const selectGameById = (state, id) => state.games.games.find((s) => s.id === id);
export const selectGamesBySeason = (state, seasonNum) => state.games.games.filter((g) => g.season === seasonNum);
export const selectAllGames = (state) => state.games.games;

export default gameSlice.reducer;
