// components/auth/AuthInitializer.tsx
'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { refreshToken } from '@/redux/features/auth/authSlice';
import { LoadingSpinner } from '@/components/loading-spinner';

/**
 * AuthInitializer - Chỉ chịu trách nhiệm:
 * 1. Gọi refreshToken() lần đầu khi app load
 * 2. Hiển thị loading trong khi check
 * 3. Để ProtectedRoute xử lý redirect logic
 */
export default function AuthInitializer({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const { isInitialized } = useAppSelector(state => state.auth);

    // Gọi refreshToken 1 lần khi app load
    useEffect(() => {
        if (!isInitialized) {
            dispatch(refreshToken());
        }
    }, [dispatch, isInitialized]);

    // Chưa check token xong → hiển thị loading
    if (!isInitialized) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <LoadingSpinner size="lg" text="Loading..." />
            </div>
        );
    }

    return <>{children}</>;
}