'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/redux/hooks';

interface AuthRouteProps {
  children: React.ReactNode;
}

/**
 * AuthRoute - Bảo vệ trang auth (login, signup, verify-otp)
 * - Nếu đã đăng nhập → redirect dashboard
 * - Nếu chưa đăng nhập → hiển thị trang
 * - Chờ isInitialized trước khi kiểm tra
 */
export default function AuthRoute({ children }: AuthRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useAppSelector(state => state.auth);

  useEffect(() => {
    // Chưa check token xong → chờ
    if (!isInitialized) return;

    // Đã đăng nhập + ở trang auth → redirect dashboard
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isInitialized, router]);

  // Chưa check token xong → không render (AuthInitializer hiển thị loading)
  if (!isInitialized) {
    return null;
  }

  // Chưa đăng nhập → hiển thị trang auth
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // Đã đăng nhập → không render (chờ redirect)
  return null;
}
