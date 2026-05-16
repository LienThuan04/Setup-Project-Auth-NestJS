import { z } from 'zod';
import { ROLES, ROLE_LIST } from '@/constants/roles';

export interface IUser {
  id: string;
  email: string;
  avatarUrl?: string | null;
  backgroundUrl?: string | null;
  description?: string | null;
  userName: string;
  accountType: string;
  roleId: string;
  roleName: string;
}

export const userFormSchema = z.object({
  email: z.string().min(6, 'Email is required').email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters').or(z.literal('')),
  userName: z.string().min(6, 'Username is required').regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, underscore'),
  roleName: z.string().min(1, 'Role is required').refine(
    (val) => ROLE_LIST.includes(val as any),
    `Role must be one of: ${ROLE_LIST.join(', ')}`
  ),
  description: z.string().max(200, 'Description must be at most 200 characters').or(z.literal('')),
});

export type UserFormData = z.infer<typeof userFormSchema>;

export { ROLES };
