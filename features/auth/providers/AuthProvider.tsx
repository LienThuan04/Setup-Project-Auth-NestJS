'use client';

import { createContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { tokenStore } from '@/lib/auth/token-store';
import { useAppDispatch } from '@/redux/hooks';
import { setAccessTokenAndUser, clearAuth } from '@/redux/features/auth/authSlice';
import { authAPI } from '@/lib/axios/api';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';

interface AuthState {
  accessToken: string | null;
  isAuthReady: boolean;
}

interface AuthContextValue extends AuthState {
  setAccessToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const [state, setState] = useState<AuthState>({
    accessToken: tokenStore.get(),
    isAuthReady: false,
  });
  const bootstrappedRef = useRef(false);

  const setAccessToken = useCallback((token: string | null) => {
    tokenStore.set(token);
    setState((prev) => ({ ...prev, accessToken: token }));
  }, []);

  useEffect(() => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;

    (async () => {
      try {
        const res = await authAPI.refreshToken();
        const newToken: string | undefined = res.data?.data?.accessToken;
        const newUser = res.data?.data?.user ?? null;
        if (newToken) {
          tokenStore.set(newToken);
          setState({ accessToken: newToken, isAuthReady: true });
          dispatch(setAccessTokenAndUser({ accessToken: newToken, user: newUser }));
        } else {
          tokenStore.clear();
          setState({ accessToken: null, isAuthReady: true });
          dispatch(clearAuth());
        }
      } catch {
        tokenStore.clear();
        setState({ accessToken: null, isAuthReady: true });
        dispatch(clearAuth());
      }
    })();

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        bootstrappedRef.current = false;
        setState((prev) => ({ ...prev, isAuthReady: false }));
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, [dispatch]);

  if (!state.isAuthReady) {
    return (
      <LoadingSkeleton
        variant="spinner"
        size="lg"
        text="Verification in progress..."
        className="min-h-screen"
      />
    );
  }

  return (
    <AuthContext.Provider value={{ ...state, setAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
}
