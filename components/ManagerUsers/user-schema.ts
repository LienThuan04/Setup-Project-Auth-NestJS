// components/ManagerUsers/user-schema.ts
import { z } from 'zod';

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

export const RoleNames = {
    USER: 'USER',
    ADMIN: 'ADMIN'
};

export const userFormSchema = z.object({
  email: z.string().min(6, 'Email is required').email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters').or(z.literal('')),
  userName: z.string().min(6, 'Username is required').min(6, 'Min 6 characters').regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, underscore'),
  roleName: z.string().min(1, 'Role is required').refine((val) => [RoleNames.USER, RoleNames.ADMIN].includes(val), 'Role must be USER or ADMIN'),
});

export type UserFormData = z.infer<typeof userFormSchema>;