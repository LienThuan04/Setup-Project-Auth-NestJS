/**
 * Hàng đợi refresh token an toàn với truy cập đồng thời (concurrency-safe).
 *
 * VẤN ĐỀ GIẢI QUYẾT: Khi nhiều API call cùng lúc bị lỗi 401,
 * chỉ MỘT lần gọi /auth/refresh được thực hiện. Các request còn lại
 * xếp hàng chờ và thử lại với token mới sau khi refresh hoàn tất.
 *
 * TẠI SAO TÁCH RIÊNG MODULE: Giúp axios interceptor gọn gàng và dễ kiểm thử.
 */

type QueueItem = {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
};

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

export const refreshQueue = {
  get isRefreshing(): boolean {
    return isRefreshing;
  },

  /** Gọi khi bắt đầu refresh — các 401 tiếp theo sẽ xếp hàng chờ */
  start(): void {
    isRefreshing = true;
  },

  /** Gọi khi refresh hoàn tất — resolve/reject tất cả request đang chờ */
  finish(error: unknown | null, token: string | null = null): void {
    failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    failedQueue = [];
    isRefreshing = false;
  },

  /**
   * Đưa request bị 401 vào hàng đợi khi refresh đang diễn ra.
   * Trả về Promise sẽ resolve/reject khi refresh hoàn tất.
   */
  enqueue<T>(originalRequest: {
    config: { _retry?: boolean };
    [key: string]: unknown;
  }): Promise<T> {
    return new Promise((resolve, reject) => {
      failedQueue.push({
        resolve: (value) => resolve(value as T),
        reject,
      });
    });
  },
};
