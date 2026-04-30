// components/auth/AuthInitializer.tsx
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { refreshToken } from '@/redux/features/auth/authSlice';
import { LoadingSkeleton } from '@/components/loading-spinner';
import { AUTH_FRONTEND_PATHS } from '@/lib/axios/auth-paths';

/**
 * AuthInitializer - Chỉ chịu trách nhiệm:
 * 1. Gọi refreshToken() lần đầu khi app load
 * 2. Hiển thị loading trong khi check
 * 3. Để ProtectedRoute xử lý redirect logic
 */
export default function AuthInitializer({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const pathname = usePathname();
    const { isInitialized } = useAppSelector(state => state.auth);
    const isAuthPage = AUTH_FRONTEND_PATHS.some(path => pathname.startsWith(path));

    // Gọi refreshToken khi app load và khi quay lại trang bằng back/forward (kể cả bfcache)
    useEffect(() => {
        if (!isInitialized) {
            dispatch(refreshToken());
        }

        const handlePageShow = (event: PageTransitionEvent) => {
            const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
            const isBackForward = navEntries[0]?.type === 'back_forward';

            if (event.persisted || isBackForward) {
                dispatch(refreshToken());
            }
        };

        window.addEventListener('pageshow', handlePageShow);
        return () => window.removeEventListener('pageshow', handlePageShow);
    }, [dispatch, isInitialized]);

    // Không chặn các trang auth bằng global loading để tránh kẹt UI khi user bấm back/forward
    if (!isInitialized && !isAuthPage) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <LoadingSkeleton variant="spinner" size="lg" text="Checking authentication..." />
            </div>
        );
    }

    return <>{children}</>;
}