import { useCallback, useEffect, useState } from 'react';
import { usersAPI } from '@/lib/axios/api';
import { handleApiError } from '@/lib/handle-error';
import type { IUser } from '@/features/users/types';

export function useProfileDetail(userId?: string) {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    if (!userId) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await usersAPI.getById(userId);
      setUser(response.data?.data ?? null);
    } catch (error) {
      handleApiError(error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user,
    isLoading,
    refetch: fetchUser,
  };
}
