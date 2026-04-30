// components/auth/AuthInitializer.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { refreshToken } from '@/redux/features/auth/authSlice';
import { LoadingSpinner } from '@/components/loading-spinner';

/**
 * AuthInitializer - Chỉ chịu trách nhiệm:
 * 1. Gọi refreshToken() lần đầu khi app load (chỉ 1 lần duy nhất)
 * 2. Hiển thị loading trong khi check
 * 3. Để ProtectedRoute xử lý redirect logic
 */
export default function AuthInitializer({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const { isInitialized } = useAppSelector(state => state.auth);
    const hasInitialized = useRef(false); // Track để chỉ gọi 1 lần

    // Gọi refreshToken 1 lần duy nhất khi app load
    useEffect(() => {
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            dispatch(refreshToken());
        }
    }, [dispatch]); // Chỉ chạy 1 lần khi mount

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