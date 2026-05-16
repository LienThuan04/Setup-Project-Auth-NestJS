'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import ProtectedRoute from '@/features/auth/providers/ProtectedRoute';
import { ROLES } from '@/constants/roles';
import { useUsers } from '@/features/users/hooks/useUsers';
import { UsersTable } from '@/features/users/components/UsersTable';
import { UsersHeader } from '@/features/users/components/UsersHeader';
import { UserDialog } from '@/features/users/components/UserDialog';
import { DeleteUserDialog } from '@/features/users/components/DeleteUserDialog';
import { Pagination } from '@/components/shared/Pagination';
import { userFormSchema } from '@/features/users/types';
import type { IUser, UserFormData } from '@/features/users/types';
import { useAppSelector } from '@/redux/hooks';

const EMPTY_FORM: UserFormData = { email: '', password: '', userName: '', roleName: ROLES.USER, description: '' };

export default function UsersPage() {
  const { users, loading, meta, setPage, search, setSearch, createUser, updateUser, deleteUser, updateRoleUser } = useUsers();
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState<UserFormData>(EMPTY_FORM);

  const authUser = useAppSelector((state) => state.auth.user);

  const handleAdd = () => { setSelectedUser(null); setFormData(EMPTY_FORM); setDialogOpen(true); };

  const handleEdit = (user: IUser) => {
    if (user.id === authUser?.id) {
      toast.info('The currently logged-in account can only view information.');
      return;
    }
    setSelectedUser(user);
    setFormData({ email: user.email, password: '', userName: user.userName, roleName: user.roleName || ROLES.USER, description: user.description || '' });
    setDialogOpen(true);
  };

  const handleDelete = (user: IUser) => {
    if (user.id === authUser?.id) {
      toast.info('The currently logged-in account can only view information.');
      return;
    }
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    const result = userFormSchema.safeParse(formData);
    if (!result.success) {
      toast.error(result.error.issues.map((i) => `(${String(i.path[0])}: ${i.message})`).join('\n'));
      return;
    }
    const ok = selectedUser
      ? await updateUser(selectedUser.id, formData)
      : await createUser(formData);
    if (!ok) return;
    setDialogOpen(false);
    setFormData(EMPTY_FORM);
  };

  const handleChangeRole = async (user: IUser, newRole: string) => {
    if (user.id === authUser?.id) {
      toast.info('The currently logged-in account can only view information.');
      return;
    }
    const ok = await updateRoleUser(user, newRole);
    if (!ok) toast.error('Failed to change role');
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    if (selectedUser.id === authUser?.id) {
      toast.info('The currently logged-in account can only view information.');
      return;
    }
    await deleteUser(selectedUser.id);
    setDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  return (
    <ProtectedRoute roles={[ROLES.ADMIN]} redirectTo="/dashboard">
      <div className="space-y-4">
        <UsersHeader search={search} onSearchChange={setSearch} onAddClick={handleAdd} />
        <UsersTable users={users} loading={loading} onEdit={handleEdit} onDelete={handleDelete} onChangeRole={handleChangeRole} currentUserId={authUser?.id} />
        {meta && <Pagination meta={meta} onPageChange={setPage} />}
        <UserDialog open={dialogOpen} onOpenChange={setDialogOpen} user={selectedUser} formData={formData} onFormChange={setFormData} onSubmit={handleSubmit} />
        <DeleteUserDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} user={selectedUser} onConfirm={handleConfirmDelete} />
      </div>
    </ProtectedRoute>
  );
}
