'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/redux/hooks';
import { ROUTES } from '@/lib/routes';

interface AuthRouteProps {
  children: React.ReactNode;
}

export default function AuthRoute({ children }: AuthRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (!isInitialized) return;
    if (redirectedRef.current) return;

    if (isAuthenticated) {
      redirectedRef.current = true;
      router.replace(ROUTES.DASHBOARD.ROOT);
    }
  }, [isAuthenticated, isInitialized, router]);

  if (!isInitialized) return null;
  if (!isAuthenticated) return <>{children}</>;
  return null;
}
