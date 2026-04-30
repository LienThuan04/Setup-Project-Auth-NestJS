import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RoleFormData } from '@/components/ManagerRoles/role-schema';
import { IRole } from '@/components/ManagerRoles/role-schema';

interface RoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: IRole | null; // null = create, IRole = edit
  formData: RoleFormData;
  onFormChange: (data: RoleFormData) => void;
  onSubmit: () => void;
}

export function RoleDialog({
  open,
  onOpenChange,
  role,
  formData,
  onFormChange,
  onSubmit,
}: RoleDialogProps) {
  const isEdit = !!role;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Role' : 'Create Role'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Role Name</label>
            <Input
              value={formData.roleName}
              onChange={(e) => onFormChange({ ...formData, roleName: e.target.value })}
              placeholder="Enter role name"
            />
            
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Input
              value={formData.description}
              onChange={(e) => onFormChange({ ...formData, description: e.target.value })}
              placeholder="Enter role description"
            />
          </div>


          <Button className="w-full" onClick={onSubmit}>
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}