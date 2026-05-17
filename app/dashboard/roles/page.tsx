'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import ProtectedRoute from '@/features/auth/providers/ProtectedRoute';
import { ROLES } from '@/constants/roles';
import { useRoles } from '@/features/roles/hooks/useRoles';
import { RolesTable } from '@/features/roles/components/RolesTable';
import { RolesHeader } from '@/features/roles/components/RolesHeader';
import { RoleDialog } from '@/features/roles/components/RoleDialog';
import { DeleteRoleDialog } from '@/features/roles/components/DeleteRoleDialog';
import { Pagination } from '@/components/shared/Pagination';
import { roleFormSchema } from '@/features/roles/types';
import type { IRole, RoleFormData } from '@/features/roles/types';
import { useAppSelector } from '@/redux/hooks';

const EMPTY_FORM: RoleFormData = { roleName: '', description: '' };

export default function RolesPage() {
  const { roles, loading, meta, setPage, onLimitChange, search, setSearch, createRole, updateRole, deleteRole } = useRoles();
  const [selectedRole, setSelectedRole] = useState<IRole | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState<RoleFormData>(EMPTY_FORM);
  const authUserRole = useAppSelector((state) => state.auth.user?.roleName);

  const handleAdd = () => { setSelectedRole(null); setFormData(EMPTY_FORM); setDialogOpen(true); };

  const handleEdit = (role: IRole) => {
    setSelectedRole(role);
    setFormData({ roleName: role.roleName, description: role.description });
    setDialogOpen(true);
  };

  const handleDelete = (role: IRole) => { setSelectedRole(role); setDeleteDialogOpen(true); };

  const handleSubmit = async () => {
    const result = roleFormSchema.safeParse(formData);
    if (!result.success) {
      toast.error(result.error.issues.map((i) => `(${String(i.path[0])}: ${i.message})`).join('\n'));
      return;
    }
    const ok = selectedRole
      ? await updateRole(selectedRole.id, formData)
      : await createRole(formData);
    if (!ok) return;
    setDialogOpen(false);
    setFormData(EMPTY_FORM);
  };

  const handleConfirmDelete = async () => {
    if (!selectedRole) return;
    await deleteRole(selectedRole.id);
    setDeleteDialogOpen(false);
    setSelectedRole(null);
  };

  return (
    <ProtectedRoute roles={[ROLES.ADMIN]} redirectTo="/dashboard">
      <div className="space-y-4">
        <RolesHeader search={search} onSearchChange={setSearch} onAddClick={handleAdd} />
        <RolesTable roles={roles} loading={loading} onEdit={handleEdit} onDelete={handleDelete} currentRoleName={authUserRole} />
        {meta && <Pagination meta={meta} onPageChange={setPage} onLimitChange={onLimitChange} />}
        <RoleDialog open={dialogOpen} onOpenChange={setDialogOpen} role={selectedRole} formData={formData} onFormChange={setFormData} onSubmit={handleSubmit} />
        <DeleteRoleDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} role={selectedRole} onConfirm={handleConfirmDelete} />
      </div>
    </ProtectedRoute>
  );
}
