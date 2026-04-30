'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '@/redux/hooks';
import { AUTH_FRONTEND_PATHS } from '@/lib/axios/auth-paths';
import { LoadingSpinner } from '@/components/loading-spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
  redirectTo?: string;
}

/**
 * ProtectedRoute - Chịu trách nhiệm:
 * 1. Chờ AuthInitializer check token xong (isInitialized = true)
 * 2. Redirect dựa trên authentication state
 * 3. Kiểm tra role nếu có
 */
export default function ProtectedRoute({ 
  children, 
  roles, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isInitialized, user } = useAppSelector(state => state.auth);

  useEffect(() => {
    // Chưa check token xong → không làm gì
    if (!isInitialized) return;

    const isAuthPage = AUTH_FRONTEND_PATHS.some(path => pathname.startsWith(path));

    // 1. Chưa đăng nhập + không ở trang auth → redirect login
    if (!isAuthenticated && !isAuthPage) {
      router.replace(redirectTo);
      return;
    }

    // 2. Đã đăng nhập + đang ở trang auth → redirect dashboard
    if (isAuthenticated && isAuthPage) {
      router.replace('/dashboard');
      return;
    }

    // 3. Kiểm tra role (nếu có yêu cầu)
    if (isAuthenticated && roles && user) {
      if (!roles.includes(user.roleName)) {
        router.replace('/unauthorized');
        return;
      }
    }
  }, [isInitialized, isAuthenticated, pathname, router, roles, user, redirectTo]);

  // Chưa check token xong → hiển thị loading
  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" text="Checking authentication..." />
      </div>
    );
  }

  // Chưa authenticated + không ở auth page → không render
  if (!isAuthenticated && !AUTH_FRONTEND_PATHS.some(path => pathname.startsWith(path))) {
    return null;
  }

  return <>{children}</>;
}