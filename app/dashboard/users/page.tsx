'use client';

import { DeleteUserDialog } from '@/components/ManagerUsers/DeleteUsersDialog';
import { UserFormData, userFormSchema } from '@/components/ManagerUsers/user-schema';
import { toast } from 'sonner';
import { UserDialog } from '@/components/ManagerUsers/UserDialog';
import { UsersHeader } from '@/components/ManagerUsers/UsersHeader';
import { UsersTable } from '@/components/ManagerUsers/UsersTable';
import { useUsers } from '@/components/ManagerUsers/useUsers';
import { IUser } from '@/components/ManagerUsers/user-schema';
import { useState, useMemo } from 'react';


const initialFormData: UserFormData = {
    email: '',
    password: '',
    userName: '',
    roleName: 'USER',
};

export default function UsersPage() {
    const { users, loading, createUser, updateUser, deleteUser, updateRoleUser } = useUsers();
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [formData, setFormData] = useState<UserFormData>(initialFormData);

    // Lọc users
    const filteredUsers = useMemo(
        () =>
            users.filter(
                (u) =>
                    u.id?.toLowerCase().includes(search.toLowerCase()) ||
                    u.userName?.toLowerCase().includes(search.toLowerCase()) ||
                    u.email?.toLowerCase().includes(search.toLowerCase())
            ),
        [users, search]
    );

    // Mở dialog Create
    const handleAdd = () => {
        setSelectedUser(null);
        setFormData(initialFormData);
        setDialogOpen(true);
    };

    // Mở dialog Edit
    const handleEdit = (user: IUser) => {
        setSelectedUser(user);
        setFormData({
            email: user.email,
            password: '',
            userName: user.userName,
            roleName: user.roleName || 'USER',
        });
        setDialogOpen(true);
    };

    // Mở dialog Delete
    const handleDelete = (user: IUser) => {
        setSelectedUser(user);
        setDeleteDialogOpen(true);
    };

    // Submit form
    const handleSubmit = async () => {
        // Validate with zod
        const result = userFormSchema.safeParse(formData);
        if (!result.success) {
            // Gộp tất cả lỗi thành 1 chuỗi
            const errorMessages = result.error.issues
                .map((issue) => `( ${String(issue.path[0])}: ${issue.message} )`)
                .join('\n');
            toast.error(errorMessages);
            return;
        }

        // Submit
        if (selectedUser) {
            const result = await updateUser(selectedUser.id, formData);
            if (!result) return; // Nếu update thất bại thì không đóng dialog
        } else {
            const result = await createUser(formData);
            if (!result) return; // Nếu tạo thất bại thì không đóng dialog
        }
        setDialogOpen(false);
        setFormData(initialFormData);
    };

    const handleChangeRole = async (user: IUser, newRole: string) => {
        const result = await updateRoleUser(user, newRole);
        if (!result) {
            toast.error('Failed to change role');
        } else {            
            toast.success('Role changed successfully');
        }
    }


    // Xác nhận xóa
    const handleConfirmDelete = async () => {
        if (!selectedUser) return;
        await deleteUser(selectedUser.id);
        setDeleteDialogOpen(false);
        setSelectedUser(null);
    };

    return (
        <div className="space-y-4">
            <UsersHeader search={search} onSearchChange={setSearch} onAddClick={handleAdd} />
            <UsersTable users={filteredUsers} loading={loading} onEdit={handleEdit} onDelete={handleDelete} onChangeRole={handleChangeRole} />
            <UserDialog open={dialogOpen} onOpenChange={setDialogOpen} user={selectedUser} formData={formData} onFormChange={setFormData} onSubmit={handleSubmit} />
            <DeleteUserDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} user={selectedUser} onConfirm={handleConfirmDelete} />
        </div>
    );
}