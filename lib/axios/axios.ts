import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { ensureDeviceId } from '@/lib/cookie';
import { shouldRefreshToken } from '@/lib/axios/refresh-exclude';
import { User } from '@/redux/types';
import { authAPI } from './api';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const ACCESS_TOKEN_KEY = process.env.NEXT_PUBLIC_ACCESS_TOKEN_KEY;
const AUTHORIZATION_HEADER = process.env.NEXT_PUBLIC_AUTHORIZATION_HEADER || 'Authorization';
const BEARER_PREFIX = process.env.NEXT_PUBLIC_BEARER_PREFIX || 'Bearer';

let getAccessToken: () => string | null = () => null;
let dispatchSetAuth: (data: { accessToken: string; user: User | null }) => void = () => { };
let dispatchClearAuth: () => void = () => { };

// Hàm để inject store vào module axios, cho phép axios có thể truy cập token và dispatch action để cập nhật auth state
export const injectStore = (
  _getAccessToken: () => string | null,
  _setAuth: (data: { accessToken: string; user: User | null }) => void,
  _clearAuth: () => void
) => {
  getAccessToken = _getAccessToken;
  dispatchSetAuth = _setAuth;
  dispatchClearAuth = _clearAuth;
};

if (!API_URL || API_URL.trim() === '') {
  throw new Error('API URL is not defined in environment variables');
}

if (!ACCESS_TOKEN_KEY || ACCESS_TOKEN_KEY.trim() === '') {
  throw new Error('ACCESS_TOKEN_KEY is not defined in environment variables');
}

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
  withCredentials: true, // Đảm bảo gửi cookie trong các request
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Đảm bảo cookie deviceId tồn tại (backend sẽ đọc từ cookie)
    ensureDeviceId();


    const token = getAccessToken();
    if (token) {
      config.headers[AUTHORIZATION_HEADER] = `${BEARER_PREFIX} ${token}`;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && shouldRefreshToken(originalRequest.url)) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers[AUTHORIZATION_HEADER] = `${BEARER_PREFIX} ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi refresh token – backend sẽ lấy deviceId từ refresh token trong cookie
         const response = await authAPI.refreshToken();
        //--------------------------------------------------------------------------
        const newToken = response.data?.data?.accessToken;
        const newUser = response.data?.data?.user;
        if (!newToken) throw new Error('No access token returned from refresh');
        // Cập nhật token mới vào store và header của axios
        dispatchSetAuth({ accessToken: newToken, user: newUser || null });
        axiosInstance.defaults.headers.common[AUTHORIZATION_HEADER] = `${BEARER_PREFIX} ${newToken}`;
        originalRequest.headers[AUTHORIZATION_HEADER] = `${BEARER_PREFIX} ${newToken}`;

        //set lại cookie deviceId để gia hạn thời gian sống sau khi refresh token
        ensureDeviceId();

        // Thực hiện lại các request bị lỗi với token mới
        processQueue(null, newToken);
        return axiosInstance(originalRequest);
      } catch (refreshError : any) {
        processQueue(refreshError, null);
        // Chỉ clearAuth nếu là lỗi thực sự (409 cũng clear)
        if (refreshError.response?.status === 409) {
          console.log('Refresh token missing, clearing auth');
        }
        dispatchClearAuth();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    if (error.response) {
      const { status, data } = error.response;
      console.error(`[API] Error ${status}:`, data?.details || data);
    } else if (error.request) {
      console.error('[API] Network error');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;