"use client";
import { toast } from 'sonner';
import { useState, useMemo } from 'react';
import { RoleFormData, roleFormSchema } from '@/components/ManagerRoles/role-schema';
import { useRoles } from '@/components/ManagerRoles/useRoles';
import { IRole } from '@/components/ManagerRoles/role-schema';
import { RolesHeader } from '@/components/ManagerRoles/RolesHeader';
import { RolesTable } from '@/components/ManagerRoles/RolesTable';
import { RoleDialog } from '@/components/ManagerRoles/RoleDialog';
import { DeleteRoleDialog } from '@/components/ManagerRoles/DeleteRoleDialog';


const initialFormData: RoleFormData = {
    roleName: '',
    description: '',
};

export default function RolesPage() {
    const { roles, loading, createRole, updateRole, deleteRole } = useRoles();
    const [search, setSearch] = useState('');
    const [selectedRole, setSelectedRole] = useState<IRole | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [formData, setFormData] = useState<RoleFormData>(initialFormData);

    // Lọc roles
    const filteredRoles = useMemo(
        () =>
            roles.filter(
                (u) =>
                    u.id?.toLowerCase().includes(search.toLowerCase()) ||
                    u.roleName?.toLowerCase().includes(search.toLowerCase()) ||
                    u.description?.toLowerCase().includes(search.toLowerCase())
            ),
        [roles, search]
    );

    // Mở dialog Create
    const handleAdd = () => {
        setSelectedRole(null);
        setFormData(initialFormData);
        setDialogOpen(true);
    };

    // Mở dialog Edit
    const handleEdit = (role: IRole) => {
        setSelectedRole(role);
        setFormData({
            roleName: role.roleName,
            description: role.description,
        });
        setDialogOpen(true);
    };

    // Mở dialog Delete
    const handleDelete = (role: IRole) => {
        setSelectedRole(role);
        setDeleteDialogOpen(true);
    };

    // Submit form
    const handleSubmit = async () => {
        // Validate with zod
        const result = roleFormSchema.safeParse(formData);
        if (!result.success) {
            // Gộp tất cả lỗi thành 1 chuỗi
            const errorMessages = result.error.issues
                .map((issue) => `( ${String(issue.path[0])}: ${issue.message} )`)
                .join('\n');
            toast.error(errorMessages);
            return;
        }

        // Submit
        if (selectedRole) {
            const result = await updateRole(selectedRole.id, formData);
            if (!result) return; // Nếu update thất bại thì không đóng dialog
        } else {
            const result = await createRole(formData);
            if (!result) return; // Nếu tạo thất bại thì không đóng dialog
        }
        setDialogOpen(false);
        setFormData(initialFormData);
    };


    // Xác nhận xóa
    const handleConfirmDelete = async () => {
        if (!selectedRole) return;
        await deleteRole(selectedRole.id);
        setDeleteDialogOpen(false);
        setSelectedRole(null);
    };

    return (
        <div className="space-y-4">
            <RolesHeader search={search} onSearchChange={setSearch} onAddClick={handleAdd} />
            <RolesTable roles={filteredRoles} loading={loading} onEdit={handleEdit} onDelete={handleDelete} />
            <RoleDialog open={dialogOpen} onOpenChange={setDialogOpen} role={selectedRole} formData={formData} onFormChange={setFormData} onSubmit={handleSubmit} />
            <DeleteRoleDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} role={selectedRole} onConfirm={handleConfirmDelete} />
        </div>
    );
}