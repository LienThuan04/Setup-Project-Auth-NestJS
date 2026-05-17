import { useState, useEffect, useCallback } from 'react';
import { usersAPI } from '@/lib/axios/api';
import { toast } from 'sonner';
import { handleApiError } from '@/lib/handle-error';
import { IUser, UserFormData } from '@/features/users/types';
import type { PaginationMeta } from '@/components/shared/Pagination';

const DEFAULT_LIMIT = 10;

export function useUsers() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search 400ms, reset về page 1 khi search thay đổi
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await usersAPI.getAll({
        page,
        limit,
        search: debouncedSearch || undefined,
      });
      const data = response.data?.data;
      setUsers(data?.items ?? []);
      setMeta(data?.meta ?? null);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const createUser = async (data: UserFormData): Promise<boolean> => {
    try {
      await usersAPI.create(data);
      toast.success('User created successfully!');
      fetchUsers();
      return true;
    } catch (error) {
      handleApiError(error);
      return false;
    }
  };

  const updateUser = async (id: string, data: Partial<UserFormData>): Promise<boolean> => {
    try {
      await usersAPI.update(id, {
        email: data.email,
        userName: data.userName,
        description: data.description,
      });
      toast.success('User updated successfully!');
      fetchUsers();
      return true;
    } catch (error) {
      handleApiError(error);
      return false;
    }
  };

  const updateRoleUser = async (user: IUser, newRole: string): Promise<boolean> => {
    try {
      await usersAPI.updateRole(user.id, { roleNameOrId: newRole });
      toast.success(`Role changed to ${newRole}`);
      fetchUsers();
      return true;
    } catch (error) {
      handleApiError(error);
      return false;
    }
  };

  const deleteUser = async (id: string): Promise<void> => {
    await usersAPI.delete(id);
    toast.success('User deleted successfully!');
    // Nếu xóa hết trang hiện tại thì về trang trước
    if (users.length === 1 && page > 1) setPage((p) => p - 1);
    else fetchUsers();
  };

  return {
    users, loading, meta,
    page, setPage,
    limit, onLimitChange: handleLimitChange,
    search, setSearch,
    createUser, updateUser, deleteUser, updateRoleUser,
    refetch: fetchUsers,
  };
}
