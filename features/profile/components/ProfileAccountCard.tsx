'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import type { IUser } from '@/features/users/types';

interface ProfileAccountCardProps {
  user: IUser;
}

/**
 * Card read-only hiển thị thông tin account.
 * Dùng toàn bộ primitive shadcn: Card / Table / Badge.
 * Đổi giao diện sau này chỉ cần edit components/ui/table.tsx, card.tsx, badge.tsx.
 */
export function ProfileAccountCard({ user }: ProfileAccountCardProps) {
  const rows: Array<{ label: string; value: React.ReactNode }> = [
    {
      label: 'Account ID',
      value: <span className="font-mono text-xs break-all">{user.id}</span>,
    },
    {
      label: 'Account type',
      value: <Badge variant="outline">{user.accountType}</Badge>,
    },
    {
      label: 'Role',
      value: <Badge>{user.roleName}</Badge>,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Details</CardTitle>
        <CardDescription>Read-only system information about this account.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.label}>
                <TableCell className="text-muted-foreground w-1/3 font-medium">
                  {row.label}
                </TableCell>
                <TableCell className="text-right break-all">{row.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
