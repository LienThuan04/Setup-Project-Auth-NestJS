/**
 * Axios instance tập trung.
 *
 * KIẾN TRÚC:
 *   - Đọc token từ tokenStore (module-level, không phụ thuộc Redux)
 *   - Request interceptor: gắn Authorization header
 *   - Response interceptor: 401 → refresh → thử lại (với hàng đợi an toàn đồng thời)
 *
 * TẠI SAO: Tách rời khỏi Redux. Token store có thể truy cập bên ngoài React tree,
 *         giúp interceptor không phụ thuộc framework và dễ kiểm thử.
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { ensureDeviceId } from '@/lib/cookie';
import { shouldRefreshToken } from '@/lib/axios/refresh-exclude';
import { tokenStore } from '@/lib/auth/token-store';
import { refreshQueue } from '@/lib/api/refresh-queue';
import { authAPI } from '@/lib/axios/api';
import { ROUTES } from '@/lib/routes';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const ACCESS_TOKEN_KEY = process.env.NEXT_PUBLIC_ACCESS_TOKEN_KEY;
const AUTHORIZATION_HEADER = process.env.NEXT_PUBLIC_AUTHORIZATION_HEADER || 'Authorization';
const BEARER_PREFIX = process.env.NEXT_PUBLIC_BEARER_PREFIX || 'Bearer';

if (!API_URL || API_URL.trim() === '') {
  throw new Error('API URL is not defined in environment variables');
}

if (!ACCESS_TOKEN_KEY || ACCESS_TOKEN_KEY.trim() === '') {
  throw new Error('ACCESS_TOKEN_KEY is not defined in environment variables');
}

// ─── Khởi tạo Axios Instance ─────────────────────────

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
  withCredentials: true, // Gửi cookie (refreshToken, deviceId)
});

// ─── Request Interceptor ─────────────────────────────

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    ensureDeviceId();

    const token = tokenStore.get();
    if (token) {
      config.headers[AUTHORIZATION_HEADER] = `${BEARER_PREFIX} ${token}`;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor ────────────────────────────

axiosInstance.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Chỉ xử lý 401 KHÔNG nằm trong danh sách loại trừ refresh
    if ( error.response?.status === 401 && !originalRequest._retry && shouldRefreshToken(originalRequest.url)) {
      // ── An toàn đồng thời: nếu refresh đang chạy, xếp hàng request này ──
      if (refreshQueue.isRefreshing) {
        try {
          await refreshQueue.enqueue(originalRequest);
          originalRequest.headers[AUTHORIZATION_HEADER] =
            `${BEARER_PREFIX} ${tokenStore.get()}`;
          return axiosInstance(originalRequest);
        } catch (queueError) {
          return Promise.reject(queueError);
        }
      }

      originalRequest._retry = true;
      refreshQueue.start();

      try {
        // Gọi /auth/refresh — backend đọc refreshToken từ HttpOnly cookie
        const response = await authAPI.refreshToken();

        const newToken: string | undefined = response.data?.data?.accessToken;

        if (!newToken) {
          throw new Error('No access token returned from refresh');
        }

        // Cập nhật module-level store (subscriber sẽ đồng bộ sang Redux)
        tokenStore.set(newToken);

        // Thử lại request gốc với token mới
        originalRequest.headers[AUTHORIZATION_HEADER] = `${BEARER_PREFIX} ${newToken}`;

        // Gia hạn thời gian sống cookie deviceId
        ensureDeviceId();

        // Resolve tất cả request đang xếp hàng
        refreshQueue.finish(null, newToken);

        return axiosInstance(originalRequest);
      } catch (refreshError: any) {
        refreshQueue.finish(refreshError, null);
        tokenStore.clear();

        // Chuyển hướng về login (chỉ phía client)
        if (typeof window !== 'undefined') {
          window.location.href = ROUTES.LOGIN;
        }
        return Promise.reject(refreshError);
      }
    }

    // ── Ghi log cho lỗi không phải 401 ──
    if (error.response) {
      const { status, data } = error.response;
      // /auth/refresh trả 401 khi chưa login là expected — không cần log
      const isExpectedRefreshFailure = authAPI.refreshToken;
      if (!isExpectedRefreshFailure) {
        console.error(`[API] Error ${status}:`, data?.details || data);
      }
    } else if (error.request) {
      console.error('[API] Network error');
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;