/**
 * Hằng số liên quan đến upload file/ảnh.
 *
 * QUY TẮC: Mọi giá trị "mềm" (loại ảnh, kích thước, mime type cho phép) đều phải nằm ở đây,
 * không hardcode trong component/page/hook. Khi backend đổi giới hạn, chỉ sửa 1 chỗ.
 *
 * Phải khớp với backend (Backend/src/users/users.controller.ts và Backend/src/users/enums/UserImageType.enum.ts).
 */

export const IMAGE_TYPES = {
  AVATAR: 'avatar',
  BACKGROUND: 'background',
} as const;

export type ImageType = (typeof IMAGE_TYPES)[keyof typeof IMAGE_TYPES];

// ─── Cấu hình upload chung cho ảnh ───────────────────────────────────────────────
export const IMAGE_UPLOAD = {
  /** Mime type cho phép — phải khớp với check ở backend */
  ALLOWED_MIME: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ] as readonly string[],

  /** Kích thước tối đa (bytes) — phải khớp với check ở backend */
  MAX_SIZE_BYTES: 10 * 1024 * 1024, // 10MB

  /** Accept attribute cho <input type="file"> */
  ACCEPT: 'image/jpeg,image/jpg,image/png,image/gif,image/webp',
} as const;

/** Helper: định dạng kích thước cho human-readable error message */
export const formatMaxSize = () => `${IMAGE_UPLOAD.MAX_SIZE_BYTES / (1024 * 1024)}MB`;
