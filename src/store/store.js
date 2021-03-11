import { configureStore } from '@reduxjs/toolkit';
import seasonReducer from '../components/slices/seasonSlice';
import gamesReducer from '../components/slices/gameSlice';
// import playersReducer from '../components/slices/playerSlice';

export default configureStore({
  reducer: {
    seasons: seasonReducer,
    games: gamesReducer,
  },
});
