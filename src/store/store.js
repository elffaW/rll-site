import { configureStore } from '@reduxjs/toolkit';
import seasonReducer from '../components/slices/seasonSlice';

export default configureStore({
  reducer: {
    seasons: seasonReducer,
  },
});
