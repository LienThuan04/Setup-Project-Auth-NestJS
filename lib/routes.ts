/**
 * Tập trung tất cả frontend route paths vào một chỗ.
 * Sử dụng ROUTES thay vì hardcode string rải rác trong code.
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  VERIFY_OTP: '/verify-otp',
  DASHBOARD: '/dashboard',
  UNAUTHORIZED: '/unauthorized',
} as const;
