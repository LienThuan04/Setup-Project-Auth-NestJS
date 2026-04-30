import { useState, useEffect, useCallback } from 'react';
import { usersAPI } from '@/lib/axios/api';
import { toast } from 'sonner';
import { handleApiError } from '@/lib/handle-error';
import { IUser, UserFormData } from '@/components/ManagerUsers/user-schema';




export function useUsers() {
    const [users, setUsers] = useState<IUser[]>([]);
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
                description: data.userName,
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
        // Gọi API đổi role
        try {
            await usersAPI.updateRole(user.id, { roleNameOrId: newRole });
            toast.success(`Role changed to ${newRole}`);
            // Refetch users
            fetchUsers();
            return true;
        } catch (error) {
            handleApiError(error);
            return false;
        }
    };

    const deleteUser = async (id: string) => {
        await usersAPI.delete(id);
        toast.success('User deleted successfully!');
        fetchUsers();
    };
    

    return { users, loading, createUser, updateUser, deleteUser, updateRoleUser, refetch: fetchUsers };
}