'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '@/redux/hooks';
import { AUTH_FRONTEND_PATHS } from '@/lib/axios/auth-paths';
import { ROUTES } from '@/lib/routes';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  roles,
  redirectTo = ROUTES.LOGIN,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isInitialized, user, isLoading } = useAppSelector((state) => state.auth);
  const redirectedRef = useRef(false);

  const isAuthPage = AUTH_FRONTEND_PATHS.some((path) => pathname.startsWith(path));

  useEffect(() => {
    if (!isInitialized || isLoading) return;
    if (redirectedRef.current) return;

    if (!isAuthenticated && !isAuthPage) {
      redirectedRef.current = true;
      router.replace(redirectTo);
      return;
    }

    if (isAuthenticated && isAuthPage) {
      redirectedRef.current = true;
      router.replace(ROUTES.DASHBOARD.ROOT);
      return;
    }

    if (isAuthenticated && roles && user) {
      if (!roles.includes(user.roleName)) {
        redirectedRef.current = true;
        router.replace(ROUTES.DASHBOARD.ROOT);
        return;
      }
    }
  }, [isInitialized, isLoading, isAuthenticated, isAuthPage, pathname, router, roles, user, redirectTo]);

  if (!isInitialized || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSkeleton variant="spinner" size="lg" text="Checking authentication..." />
      </div>
    );
  }

  if (!isAuthenticated && !isAuthPage) return null;

  return <>{children}</>;
}
