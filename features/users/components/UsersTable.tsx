import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Trash2 } from 'lucide-react';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ROLE_LIST } from '@/constants/roles';
import type { IUser } from '@/features/users/types';

interface UsersTableProps {
  users: IUser[];
  loading: boolean;
  onEdit: (user: IUser) => void;
  onDelete: (user: IUser) => void;
  onChangeRole: (user: IUser, newRole: string) => void;
  currentUserId?: string;
}

export function UsersTable({ users, loading, onEdit, onDelete, onChangeRole, currentUserId }: UsersTableProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <LoadingSkeleton variant="table" rows={5} cols={6} text="Loading users..." />
        </CardContent>
      </Card>
    );
  }

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">No users found</CardContent>
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
              <TableHead>UserName</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatarUrl || ''} />
                      <AvatarFallback>{user.userName?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.userName}</span>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Select value={user.roleName || 'USER'} onValueChange={(value) => onChangeRole(user, value)} disabled={user.id === currentUserId}>
                    <SelectTrigger className="h-8 w-[110px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_LIST.map((role) => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{user.accountType || 'local'}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(user)} disabled={user.id === currentUserId}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(user)} disabled={user.id === currentUserId}>
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
