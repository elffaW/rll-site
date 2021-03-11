import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../utils/api';

const initialState = {
  seasons: [],
  currentSeason: null,
  status: 'idle', // 'idle' | 'loading' | 'success' | 'failed'
  error: null, // string | null
};

export const fetchSeasons = createAsyncThunk('seasons/fetchSeasons', async () => {
  const response = await api.getAllSeasons();
  return response.map((s) => s.data);
});

/* eslint-disable no-param-reassign */
export const seasonSlice = createSlice({
  name: 'seasons',
  initialState,
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
    updateSeason: (state, action) => {
      // action.payload should be the int ID of the new season
      state.currentSeason = state.seasons.find((s) => s.id === action.payload);
    },
  },
  extraReducers: {
    [fetchSeasons.pending]: (state) => {
      state.status = 'loading';
    },
    [fetchSeasons.fulfilled]: (state, action) => {
      state.status = 'success';
      state.seasons = state.seasons.concat(action.payload);
      state.currentSeason = state.seasons[state.seasons.length - 1]; // go to most recent season by default
    },
    [fetchSeasons.rejected]: (state, action) => {
      state.status = 'failed';
      state.error = action.error.message;
    },
  },
});
/* eslint-enable no-param-reassign */

export const { updateSeason } = seasonSlice.actions;

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched
export const updateSeasonAsync = (seasonNum) => (
  dispatch,
) => {
  setTimeout(() => {
    dispatch(updateSeason(seasonNum));
  }, 1000);
};

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.season.value)`
export const selectCurrentSeason = (state) => state.seasons.currentSeason;
export const selectSeasonById = (state, id) => state.seasons.seasons.find((s) => s.id === id);
export const selectAllSeasons = (state) => state.seasons.seasons;

export default seasonSlice.reducer;
