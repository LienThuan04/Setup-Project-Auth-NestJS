/**
 * Danh sách các FRONTEND paths không cần gọi refresh token
 * (trang auth: login, signup, verify-otp, google callback...)
 */
export const AUTH_FRONTEND_PATHS: string[] = [
  '/login',
  '/signup',
  '/verify-otp',
  '/auth/google/callback',
];

/**
 * Danh sách các API paths không được refresh token khi gặp 401
 * (đã có trong refresh-exclude.ts)
 */
export const REFRESH_EXCLUDE_API_URLS: string[] = [
  '/auth/login',
  '/auth/register',
  '/auth/verify-register-otp',
  '/auth/resend-register-otp',
  '/auth/refresh',
  '/auth/google',
  '/auth/google/callback',
];