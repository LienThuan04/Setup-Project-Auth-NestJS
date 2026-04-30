import { useState, useEffect, useCallback } from 'react';
import { usersAPI } from '@/lib/axios/api';
import { toast } from 'sonner';
import { handleApiError } from '@/lib/handle-error';

export interface User {
  id: string;
  email: string;
  userName: string;
  roleName?: string;
  avatarUrl?: string | null;
  description?: string | null;
  accountType?: string;
  createdAt?: string;
}

export interface UserFormData {
  email: string;
  password: string;
  userName: string;
  roleName: string;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data?.data || response.data || []);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const createUser = async (data: UserFormData) => {
    await usersAPI.create(data);
    toast.success('User created successfully!');
    fetchUsers();
  };

  const updateUser = async (id: string, data: Partial<UserFormData>) => {
    await usersAPI.update(id, {
      email: data.email,
      userName: data.userName,
      description: data.userName,
    });
    toast.success('User updated successfully!');
    fetchUsers();
  };

  const deleteUser = async (id: string) => {
    await usersAPI.delete(id);
    toast.success('User deleted successfully!');
    fetchUsers();
  };

  return { users, loading, createUser, updateUser, deleteUser, refetch: fetchUsers };
}