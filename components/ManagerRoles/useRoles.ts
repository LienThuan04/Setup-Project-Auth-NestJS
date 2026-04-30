import { useState, useEffect, useCallback } from 'react';
import { rolesAPI } from '@/lib/axios/api';
import { toast } from 'sonner';
import { handleApiError } from '@/lib/handle-error';
import { IRole, RoleFormData } from '@/components/ManagerRoles/role-schema';



export function useRoles() {
    const [roles, setRoles] = useState<IRole[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRoles = useCallback(async () => {
        setLoading(true);
        try {
            const response = await rolesAPI.getAll();
            setRoles(response.data?.data || response.data || []);
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    }, []);

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
            await rolesAPI.update(id, {
                roleName: data.roleName,
                description: data.description,
            });
            toast.success('Role updated successfully!');
            fetchRoles();
            return true;
        } catch (error) {
            handleApiError(error);
            return false;
        }
    };

    const deleteRole = async (id: string) => {
        await rolesAPI.delete(id);
        toast.success('Role deleted successfully!');
        fetchRoles();
    };

    return { roles, loading, createRole, updateRole, deleteRole, refetch: fetchRoles };
}