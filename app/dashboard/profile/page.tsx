'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/routes';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';

export default function ProfilePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(ROUTES.DASHBOARD.SETTINGS_TAB('profile'));
  }, [router]);

  return (
    <div className="py-8">
      <LoadingSkeleton variant="spinner" size="lg" text="Redirecting to account settings..." />
    </div>
  );
}
