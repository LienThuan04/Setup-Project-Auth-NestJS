/**
 * Tên các role trong hệ thống — phải khớp với backend (NAME_ROLE_ADMIN, NAME_ROLE_USER trong .env).
 * Thay đổi tên role chỉ cần sửa ở đây.
 */
export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LIST: RoleName[] = Object.values(ROLES);
