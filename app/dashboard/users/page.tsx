'use client';

import { DeleteUserDialog } from '@/components/ManagerUsers/DeleteUserDialog';
import { UserDialog } from '@/components/ManagerUsers/UserDialog';
import { UsersHeader } from '@/components/ManagerUsers/UsersHeader';
import { UsersTable } from '@/components/ManagerUsers/UsersTable';
import { User, UserFormData, useUsers } from '@/components/ManagerUsers/useUsers';
import { useState, useMemo } from 'react';


const initialFormData: UserFormData = {
  email: '',
  password: '',
  userName: '',
  roleName: 'USER',
};

export default function UsersPage() {
  const { users, loading, createUser, updateUser, deleteUser } = useUsers();
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState<UserFormData>(initialFormData);

  // Lọc users
  const filteredUsers = useMemo(
    () =>
      users.filter(
        (u) =>
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
  const handleEdit = (user: User) => {
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
  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  // Submit form
  const handleSubmit = async () => {
    if (selectedUser) {
      await updateUser(selectedUser.id, formData);
    } else {
      await createUser(formData);
    }
    setDialogOpen(false);
    setFormData(initialFormData);
  };

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
      <UsersTable users={filteredUsers} loading={loading} onEdit={handleEdit} onDelete={handleDelete} />
      <UserDialog open={dialogOpen} onOpenChange={setDialogOpen} user={selectedUser} formData={formData} onFormChange={setFormData} onSubmit={handleSubmit} />
      <DeleteUserDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} user={selectedUser} onConfirm={handleConfirmDelete} />
    </div>
  );
}