/**
 * Danh sách các endpoint KHÔNG được tự động refresh token khi gặp 401
 * (vì chưa có refresh token hoặc không cần refresh)
 */
export const REFRESH_EXCLUDE_URLS: string[] = [
  '/auth/login',
  '/auth/register',
  '/auth/verify-register-otp',
  '/auth/resend-register-otp',
  '/auth/refresh',
  '/auth/google',
  '/auth/google/callback',
];

/**
 * Kiểm tra URL có nên refresh token không
 */
export function shouldRefreshToken(url?: string): boolean {
  if (!url) return false;
  return !REFRESH_EXCLUDE_URLS.some((excludeUrl) => url.startsWith(excludeUrl));
}