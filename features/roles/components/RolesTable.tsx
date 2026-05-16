import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2 } from 'lucide-react';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import type { IRole } from '@/features/roles/types';

interface RolesTableProps {
  roles: IRole[];
  loading: boolean;
  onEdit: (role: IRole) => void;
  onDelete: (role: IRole) => void;
  currentRoleName?: string;
}

export function RolesTable({ roles, loading, onEdit, onDelete, currentRoleName }: RolesTableProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <LoadingSkeleton variant="table" rows={5} cols={4} text="Loading roles..." />
        </CardContent>
      </Card>
    );
  }

  if (roles.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">No roles found</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Role Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell>{role.id}</TableCell>
                <TableCell>{role.roleName}</TableCell>
                <TableCell>{role.description}</TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(role)} disabled={role.roleName === 'ADMIN' || role.roleName === 'USER' || currentRoleName === 'USER'}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(role)} disabled={role.roleName === 'ADMIN' || role.roleName === 'USER' || currentRoleName === 'USER'}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
