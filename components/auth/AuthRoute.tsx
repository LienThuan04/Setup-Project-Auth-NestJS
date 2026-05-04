'use client';

/**
 * AuthRoute — Bảo vệ các trang auth (login, signup, verify-otp).
 *
 * KIẾN TRÚC: AuthProvider đã khởi tạo auth xong.
 *   - Nếu đã xác thực → chuyển hướng về dashboard
 *   - Nếu chưa xác thực → hiển thị trang auth
 */

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

  // AuthProvider đang khởi tạo → không render gì (global spinner được hiển thị)
  if (!isInitialized) {
    return null;
  }

  // Chưa xác thực → hiển thị trang auth
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // Đã xác thực → không render gì (chuyển hướng sẽ xảy ra)
  return null;
}
