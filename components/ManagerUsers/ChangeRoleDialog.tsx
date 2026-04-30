'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import type { IUser } from '@/components/ManagerUsers/user-schema';
import { rolesAPI } from '@/lib/axios/api';
import { handleApiError } from '@/lib/handle-error';

interface ChangeRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: IUser | null;
  onRoleChanged: () => void;
}

export function ChangeRoleDialog({
  open,
  onOpenChange,
  user,
  onRoleChanged,
}: ChangeRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState(user?.roleName || 'USER');
  const [loading, setLoading] = useState(false);

  const handleChangeRole = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await rolesAPI.update(user.roleId || '', { roleName: selectedRole });
      toast.success('Role updated successfully!');
      onRoleChanged();
      onOpenChange(false);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Role for {user?.userName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USER">USER</SelectItem>
              <SelectItem value="ADMIN">ADMIN</SelectItem>
            </SelectContent>
          </Select>
          <Button className="w-full" onClick={handleChangeRole} disabled={loading}>
            {loading ? 'Updating...' : 'Change Role'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}