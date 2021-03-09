import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../utils/api';

const initialState = {
  players: [],
  currentPlayer: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null, // string | null
};

export const fetchPlayers = createAsyncThunk('players/fetchPlayers', async () => {
  const response = await api.getAllPlayers();
  return response.map((resp) => resp.data);
});

/* eslint-disable no-param-reassign */
export const playerSlice = createSlice({
  name: 'players',
  initialState,
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
    updatePlayer: (state, action) => {
      state.value = action.payload;
    },
  },
  extraReducers: {
    [fetchPlayers.pending]: (state) => {
      state.status = 'loading';
    },
    [fetchPlayers.fulfilled]: (state, action) => {
      state.status = 'succeeded';
      state.players = state.players.concat(action.payload);
    },
    [fetchPlayers.rejected]: (state, action) => {
      state.status = 'failed';
      state.error = action.error.message;
    },
  },
});
/* eslint-enable no-param-reassign */

export const { updatePlayer } = playerSlice.actions;

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched
export const updatePlayerAsync = (playerNum) => (
  dispatch,
) => {
  setTimeout(() => {
    dispatch(updatePlayer(playerNum));
  }, 1000);
};

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.player.value)`
export const selectCurrentPlayer = (state) => state.players[state.players.length - 1];

export const selectAllPlayers = (state) => state.players;

export default playerSlice.reducer;
