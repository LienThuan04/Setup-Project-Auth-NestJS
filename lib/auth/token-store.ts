/**
 * Kho lưu trữ token trong bộ nhớ (module-level).
 *
 * TẠI SAO: Có thể truy cập từ axios interceptors (bên ngoài React tree)
 * mà không phụ thuộc vào Redux. Redux chỉ là consumer ở tầng UI,
 * được đồng bộ bởi AuthProvider — dễ dàng thay thế.
 *
 * TUYỆT ĐỐI không lưu token vào localStorage (rủi ro XSS).
 */
type Listener = (token: string | null) => void;

let accessToken: string | null = null;
const listeners = new Set<Listener>();

export const tokenStore = {
  get: (): string | null => accessToken,

  set: (token: string | null): void => {
    accessToken = token;
    listeners.forEach((fn) => fn(token));
  },

  clear: (): void => {
    accessToken = null;
    listeners.forEach((fn) => fn(null));
  },

  /** Đăng ký lắng nghe thay đổi token (dùng để đồng bộ sang Redux) */
  subscribe: (fn: Listener): (() => void) => {
    listeners.add(fn); // Trả về hàm hủy đăng ký
    return () => listeners.delete(fn); // Hủy đăng ký khi không còn cần thiết
  },
};
