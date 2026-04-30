import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from '@/redux/features/auth/authSlice';
import { injectStore } from '@/lib/axios/axios';
import counterReducer from '@/redux/features/counter/counterSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    counter: counterReducer,
  },
});

injectStore(
  () => store.getState().auth.accessToken,
  (data) => store.dispatch({ type: 'auth/setAccessTokenAndUser', payload: data }),
  () => store.dispatch({ type: 'auth/clearAuth' })
);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;