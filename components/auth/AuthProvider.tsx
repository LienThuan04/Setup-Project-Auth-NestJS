'use client';

/**
 * AuthProvider — nguồn sự thật duy nhất (single source of truth) cho trạng thái xác thực.
 *
 * KIẾN TRÚC:
 *   AuthProvider (khởi tạo + trạng thái)
 *        │
 *        ├── tokenStore (module-level, axios interceptors truy cập được)
 *        │
 *        └── Redux authSlice (consumer ở tầng UI, dễ dàng thay thế)
 *
 * TẠI SAO: Tách biệt vòng đời xác thực khỏi UI và tầng API.
 *         Redux không còn là nguồn sự thật — chỉ là consumer.
 */

import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { tokenStore } from '@/lib/auth/token-store';
import { useAppDispatch } from '@/redux/hooks';
import { setAccessTokenAndUser } from '@/redux/features/auth/authSlice';
import { authAPI } from '@/lib/axios/api';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

// ─── Kiểu dữ liệu ───────────────────────────────────

interface AuthState {
  accessToken: string | null;
  isAuthReady: boolean; // true sau khi bootstrap refresh hoàn tất (thành công hoặc thất bại)
}

interface AuthContextValue extends AuthState {
  setAccessToken: (token: string | null) => void;
}

// ─── Context ─────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const [state, setState] = useState<AuthState>({
    accessToken: tokenStore.get(), // Khôi phục từ module store (sống sót qua HMR)
    isAuthReady: false,
  });
  const bootstrappedRef = useRef(false);

  // ── setAccessToken (tham chiếu ổn định) ──
  const setAccessToken = useCallback((token: string | null) => {
    tokenStore.set(token);
    setState((prev) => ({ ...prev, accessToken: token }));
  }, []);

  // ── Bootstrap: gọi /auth/refresh một lần khi mount ──
  useEffect(() => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;

    (async () => {
      try {
        const res = await authAPI.refreshToken();
        const newToken: string | undefined = res.data?.data?.accessToken;
        const newUser = res.data?.data?.user ?? null;
        if (newToken) {
          tokenStore.set(newToken);
          setState({ accessToken: newToken, isAuthReady: true });
          // Đồng bộ dữ liệu xác thực đầy đủ (token + user) sang Redux
          dispatch(setAccessTokenAndUser({ accessToken: newToken, user: newUser }));
        } else {
          tokenStore.clear();
          setState({ accessToken: null, isAuthReady: true });
        }
      } catch {
        // Refresh thất bại — người dùng chưa xác thực (bình thường với lần truy cập đầu)
        tokenStore.clear();
        setState({ accessToken: null, isAuthReady: true });
      }
    })();

    // Xử lý bfcache (back/forward cache) — kiểm tra lại auth khi hiển thị trang
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        bootstrappedRef.current = false;
        setState((prev) => ({ ...prev, isAuthReady: false }));
      }
    };
    // Đăng ký sự kiện pageshow để xử lý trường hợp bfcache (back/forward cache)
    window.addEventListener('pageshow', handlePageShow);
    // Hủy đăng ký sự kiện khi component unmount
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, [dispatch]);

  // ── Chặn render cho đến khi auth được khởi tạo xong ──
  if (!state.isAuthReady) {
    return (
    <LoadingSkeleton variant="spinner" size="lg" text="Verification in progress..." className="min-h-screen" />
    );
  }

  return (
    <AuthContext.Provider value={{ ...state, setAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
}
