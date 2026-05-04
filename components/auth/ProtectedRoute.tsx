'use client';

/**
 * ProtectedRoute — Bảo vệ các trang yêu cầu xác thực.
 *
 * KIẾN TRÚC: AuthProvider đã khởi tạo auth xong (token đã sẵn sàng).
 *   Component này CHỈ xử lý logic chuyển hướng — KHÔNG gọi refresh.
 *
 * TẠI SAO: Trách nhiệm đơn nhất. AuthProvider = khởi tạo, ProtectedRoute = canh gác.
 *         Loại bỏ logic refresh trùng lặp gây ra race condition.
 */

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '@/redux/hooks';
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
  redirectTo = ROUTES.LOGIN,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isInitialized, user, isLoading } = useAppSelector(
    (state) => state.auth,
  );
  const redirectedRef = useRef(false);

  const isAuthPage = AUTH_FRONTEND_PATHS.some((path) => pathname.startsWith(path));

  // ── Logic chuyển hướng (chạy SAU KHI AuthProvider khởi tạo xong) ──
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
        router.replace(ROUTES.UNAUTHORIZED);
        return;
      }
    }
  }, [isInitialized, isLoading, isAuthenticated, isAuthPage, pathname, router, roles, user, redirectTo]);

  // ── Đang khởi tạo → hiển thị loader ──
  if (!isInitialized || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSkeleton variant="spinner" size="lg" text="Đang kiểm tra xác thực..." />
      </div>
    );
  }

  // ── Chưa xác thực → không render gì (chuyển hướng sẽ xảy ra) ──
  if (!isAuthenticated && !isAuthPage) {
    return null;
  }

  return <>{children}</>;
}