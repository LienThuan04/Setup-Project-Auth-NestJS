import { useState, useEffect, useCallback } from 'react';
import { rolesAPI } from '@/lib/axios/api';
import { toast } from 'sonner';
import { handleApiError } from '@/lib/handle-error';
import { IRole, RoleFormData } from '@/features/roles/types';
import type { PaginationMeta } from '@/components/shared/Pagination';

const DEFAULT_LIMIT = 10;

export function useRoles() {
  const [roles, setRoles] = useState<IRole[]>([]);
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
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await rolesAPI.getAll({
        page,
        limit,
        search: debouncedSearch || undefined,
      });
      const data = response.data?.data;
      setRoles(data?.items ?? []);
      setMeta(data?.meta ?? null);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const createRole = async (data: RoleFormData): Promise<boolean> => {
    try {
      await rolesAPI.create(data);
      toast.success('Role created successfully!');
      fetchRoles();
      return true;
    } catch (error) {
      handleApiError(error);
      return false;
    }
  };

  const updateRole = async (id: string, data: Partial<RoleFormData>): Promise<boolean> => {
    try {
      await rolesAPI.update(id, { roleName: data.roleName, description: data.description });
      toast.success('Role updated successfully!');
      fetchRoles();
      return true;
    } catch (error) {
      handleApiError(error);
      return false;
    }
  };

  const deleteRole = async (id: string): Promise<void> => {
    await rolesAPI.delete(id);
    toast.success('Role deleted successfully!');
    if (roles.length === 1 && page > 1) setPage((p) => p - 1);
    else fetchRoles();
  };

  return {
    roles, loading, meta,
    page, setPage,
    limit, onLimitChange: handleLimitChange,
    search, setSearch,
    createRole, updateRole, deleteRole,
    refetch: fetchRoles,
  };
}
