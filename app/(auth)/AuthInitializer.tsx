'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { refreshToken } from '@/redux/features/auth/authSlice';
import { AUTH_FRONTEND_PATHS } from '@/lib/axios/auth-paths';

export default function AuthInitializer({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const { isAuthenticated } = useAppSelector(state => state.auth);

    useEffect(() => {
        if (isAuthenticated) return;

        const initAuth = async () => {
            if(AUTH_FRONTEND_PATHS.some(url => window.location.pathname.startsWith(url))) return; // Nếu đã có accessToken hợp lệ, không cần refresh
            try {
                await dispatch(refreshToken()).unwrap();
                // Redux đã tự cập nhật state trong extraReducers
            } catch (error) {
                console.log('No valid session found');
            }
        };
        initAuth();
    }, [dispatch]);

    return <>{children}</>;
}