/**
 * Tập trung tất cả frontend route paths vào một chỗ.
 * Sử dụng ROUTES thay vì hardcode string rải rác trong code.
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  VERIFY_OTP: '/verify-otp',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: {
    ROOT: '/dashboard',
    USER_MANAGEMENT: '/dashboard/users',
    ROLE_MANAGEMENT: '/dashboard/roles',
    PROFILE: '/dashboard/profile',
    SETTINGS: '/dashboard/settings',
  },
  UNAUTHORIZED: '/unauthorized',
} as const;
