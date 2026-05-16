import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { IUser, UserFormData } from '@/features/users/types';

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: IUser | null;
  formData: UserFormData;
  onFormChange: (data: UserFormData) => void;
  onSubmit: () => void;
}

export function UserDialog({ open, onOpenChange, user, formData, onFormChange, onSubmit }: UserDialogProps) {
  const isEdit = !!user;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit User' : 'Create User'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Username</label>
            <Input
              value={formData.userName}
              onChange={(e) => onFormChange({ ...formData, userName: e.target.value })}
              placeholder="johndoe"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              value={formData.email}
              onChange={(e) => onFormChange({ ...formData, email: e.target.value })}
              type="email"
              placeholder="user@example.com"
            />
          </div>
          {!isEdit && (
            <div>
              <label className="text-sm font-medium">Password</label>
              <Input
                value={formData.password}
                onChange={(e) => onFormChange({ ...formData, password: e.target.value })}
                type="password"
                placeholder="••••••"
              />
            </div>
          )}
          <Button className="w-full" onClick={onSubmit}>
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
