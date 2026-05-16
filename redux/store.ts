import { configureStore } from '@reduxjs/toolkit';
import { authReducer, setAccessTokenAndUser, clearAuth } from '@/redux/features/auth/authSlice';
import { themeReducer } from '@/redux/features/theme/themeSlice';
import { tokenStore } from '@/lib/auth/token-store';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
  },
});

/**
 * Đăng ký lắng nghe thay đổi từ tokenStore và đồng bộ sang Redux.
 *
 * TẠI SAO: Axios interceptor cập nhật tokenStore trực tiếp (bên ngoài React tree).
 *         Subscriber này đảm bảo Redux luôn đồng bộ cho các UI component.
 *         Nếu loại bỏ Redux sau này, chỉ cần xóa subscriber này —
 *         luồng xác thực cốt lõi (tokenStore + axios) vẫn hoạt động.
 *
 * LƯU Ý: Truyền `user: null` để tránh ghi đè dữ liệu user do AuthProvider thiết lập.
 *        accessToken và isAuthenticated là nguồn sự thật ở đây.
 */
tokenStore.subscribe((token) => {
  if (token) {
    store.dispatch(setAccessTokenAndUser({ accessToken: token, user: null }));
  } else {
    store.dispatch(clearAuth());
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;