import { z } from 'zod';

/**
 * Schema validate cho form thông tin cá nhân.
 * Dùng được cho mọi role — không có nhánh logic theo role ở đây.
 */
export const profileFormSchema = z.object({
  userName: z
    .string()
    .min(6, 'Username must be at least 6 characters')
    .max(50, 'Username must be at most 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, underscore'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email'),
  description: z
    .string()
    .max(200, 'Bio must be at most 200 characters')
    .or(z.literal('')),
});

export type ProfileFormData = z.infer<typeof profileFormSchema>;
