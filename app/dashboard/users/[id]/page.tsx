'use client';

import { useParams } from 'next/navigation';
import ProtectedRoute from '@/features/auth/providers/ProtectedRoute';
import { ProfileScreen } from '@/features/profile/components/ProfileScreen';
import { useProfileDetail } from '@/features/profile/hooks/useProfileDetail';
import { ROUTES } from '@/lib/routes';
import { ROLES } from '@/constants/roles';

export default function UserProfileDetailPage() {
  const params = useParams<{ id: string }>();
  const userId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { user, isLoading } = useProfileDetail(userId);

  return (
    <ProtectedRoute roles={[ROLES.ADMIN]} redirectTo={ROUTES.DASHBOARD.ROOT}>
      <ProfileScreen
        user={user}
        mode="view"
        title="User Profile"
        description="View profile information for this system account."
        isLoading={isLoading}
        backHref={ROUTES.DASHBOARD.USER_MANAGEMENT}
        backLabel="Back to users"
      />
    </ProtectedRoute>
  );
}
