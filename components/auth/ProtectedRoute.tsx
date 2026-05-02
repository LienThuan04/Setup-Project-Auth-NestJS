'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { refreshToken } from '@/redux/features/auth/authSlice';
import { AUTH_FRONTEND_PATHS } from '@/lib/axios/auth-paths';
import { ROUTES } from '@/lib/routes';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  roles, 
  redirectTo = ROUTES.LOGIN
}: ProtectedRouteProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isInitialized, user, isLoading } = useAppSelector(state => state.auth);
  const [localReady, setLocalReady] = useState(false);

  // 👇 Tự gọi refreshToken khi mount (Back/Forward hoặc F5)
  useEffect(() => {
    if (!isInitialized) {
      dispatch(refreshToken()).finally(() => setLocalReady(true));
    } else {
      setLocalReady(true);
    }
  }, [dispatch, isInitialized]);

  const isAuthPage = AUTH_FRONTEND_PATHS.some(path => pathname.startsWith(path));

  // 👇 Redirect sau khi ready
  useEffect(() => {
    if (!localReady || isLoading) return;

    if (!isAuthenticated && !isAuthPage) {
      router.replace(redirectTo);
      return;
    }

    if (isAuthenticated && isAuthPage) {
      router.replace(ROUTES.DASHBOARD.ROOT);
      return;
    }

    if (isAuthenticated && roles && user) {
      if (!roles.includes(user.roleName)) {
        router.replace(ROUTES.UNAUTHORIZED);
        return;
      }
    }
  }, [localReady, isLoading, isAuthenticated, isAuthPage, pathname, router, roles, user, redirectTo]);

  // 👇 Loading
  if (!localReady || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSkeleton variant="spinner" size="lg" text="Checking authentication..." />
      </div>
    );
  }

  if (!isAuthenticated && !isAuthPage) {
    return null;
  }

  return <>{children}</>;
}