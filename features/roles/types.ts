import { z } from 'zod';

export interface IRole {
  id: string;
  roleName: string;
  description: string;
}

export const roleFormSchema = z.object({
  roleName: z.string().min(1, 'Role name is required'),
  description: z.string().max(200, 'Description must be less than 200 characters'),
});

export type RoleFormData = z.infer<typeof roleFormSchema>;
