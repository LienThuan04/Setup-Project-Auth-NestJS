'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { setAccessTokenAndUser } from '@/redux/features/auth/authSlice';
import { store } from '@/redux/store';
import { ROUTES } from '@/lib/routes';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenKey = process.env.NEXT_PUBLIC_ACCESS_TOKEN_KEY;

  useEffect(() => {
    const encodedData = searchParams.get('data');
    
    if (!encodedData) {
      toast.error('Google login failed - no data received');
      router.push(ROUTES.LOGIN);
      return;
    }

    try {
      // Giải mã base64
      const jsonStr = atob(decodeURIComponent(encodedData));
      const data = JSON.parse(jsonStr);
      
      const { accessToken, user } = data;
      
      if (!accessToken || !user) {
        throw new Error('Invalid data received');
      }
      if (!tokenKey) {
        toast.error('Access token key not configured in environment variables');
        router.push(ROUTES.LOGIN);
        return;
      }

      // Lưu token và user vào redux store Cách này đảm bảo cả token và user được cập nhật đồng thời, tránh lỗi không đồng bộ
      store.dispatch(setAccessTokenAndUser({ accessToken, user }));


      toast.success(`Welcome, ${user.userName}!`);
      router.push(ROUTES.DASHBOARD.ROOT);
    } catch (error) {
      console.error('Failed to parse Google login data:', error);
      toast.error('Google login failed');
      router.push(ROUTES.LOGIN);
    }
  }, [searchParams, router, tokenKey]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingSkeleton variant="spinner" size="lg" text="Processing Google login..." />
    </div>
  );
}