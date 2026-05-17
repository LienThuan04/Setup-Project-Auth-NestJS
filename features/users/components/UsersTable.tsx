import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { EyeIcon, Pencil, Trash2 } from 'lucide-react';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ROLE_LIST } from '@/constants/roles';
import type { IUser } from '@/features/users/types';
import { ROUTES } from '@/lib/routes';

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
            {users.map((user) => {
              const isCurrentUser = user.id === currentUserId;
              const profileHref = isCurrentUser
                ? ROUTES.DASHBOARD.SETTINGS_TAB('profile')
                : ROUTES.DASHBOARD.USER_DETAIL(user.id);

              return (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatarUrl || ''} />
                        <AvatarFallback>{user.userName?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{user.userName}</span>
                        {isCurrentUser && <Badge variant="outline">Current account</Badge>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Select value={user.roleName || 'USER'} onValueChange={(value) => onChangeRole(user, value)} disabled={isCurrentUser}>
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
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={profileHref}>
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onEdit(user)} disabled={isCurrentUser}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(user)} disabled={isCurrentUser}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
