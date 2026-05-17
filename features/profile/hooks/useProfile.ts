import { useState } from 'react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { patchUser } from '@/redux/features/auth/authSlice';
import { usersAPI } from '@/lib/axios/api';
import { handleApiError } from '@/lib/handle-error';
import { IMAGE_TYPES, IMAGE_UPLOAD, formatMaxSize, type ImageType } from '@/constants/upload';
import type { ProfileFormData } from '@/features/profile/types';
import type { IUser } from '@/features/users/types';

export interface OtpRequiredResult {
  needsOtp: true;
  targetEmail: string;
  changes: string[];
}

export interface UpdateSuccessResult {
  needsOtp: false;
  user: IUser;
}

export type SaveInfoResult = OtpRequiredResult | UpdateSuccessResult | false;

/**
 * Hook quản lý mọi thao tác trên profile của user đang đăng nhập.
 *
 * Dùng chung cho MỌI role.
 * Sử dụng OTP-flow mới: POST /users/update-profile/request-otp + verify-otp.
 *
 * Trả về:
 *   user            — user hiện tại từ Redux (hoặc null nếu chưa load)
 *   isSavingInfo    — đang gọi update info
 *   isVerifyingOtp  — đang chờ người dùng nhập OTP
 *   otpTargetEmail  — email đang chờ OTP (đã mask)
 *   otpChanges      — danh sách thay đổi đang chờ xác nhận
 *   isUploadingImg  — đang upload avatar/background
 *   saveInfo()      — submit form info, trả về kết quả
 *   verifyOtp()     — xác nhận OTP và áp dụng thay đổi
 *   cancelOtp()     — hủy pending OTP
 *   uploadImage()   — upload avatar hoặc background
 */
export function useProfile() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const [isUploadingImg, setIsUploadingImg] = useState<ImageType | null>(null);

  // OTP flow state
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpTargetEmail, setOtpTargetEmail] = useState('');
  const [otpChanges, setOtpChanges] = useState<string[]>([]);

  /** Validate file ảnh trước khi upload — trả về string lỗi hoặc null nếu hợp lệ */
  const validateImage = (file: File): string | null => {
    if (!IMAGE_UPLOAD.ALLOWED_MIME.includes(file.type)) {
      return `Invalid file type. Allowed: ${IMAGE_UPLOAD.ALLOWED_MIME.join(', ')}`;
    }
    if (file.size > IMAGE_UPLOAD.MAX_SIZE_BYTES) {
      return `File size exceeds ${formatMaxSize()}`;
    }
    return null;
  };

  const saveInfo = async (data: ProfileFormData): Promise<SaveInfoResult> => {
    if (!user) return false;
    setIsSavingInfo(true);
    try {
      const response = await usersAPI.requestUpdateOtp({
        userName: data.userName,
        email: data.email,
        description: data.description,
      });

      const result = response.data; // TransformInterceptor spreads: { statusCode, message, skipOtp, data }

      // Trường hợp chỉ đổi description → cập nhật ngay, không OTP
      if (result.skipOtp) {
        dispatch(patchUser({
          userName: data.userName,
          email: data.email,
          description: data.description,
        }));
        toast.success('Profile updated successfully');
        return { needsOtp: false, user: result.data };
      }

      // Cần OTP → lưu state để hiển thị OTP dialog
      setOtpTargetEmail(result.data.targetEmail);
      setOtpChanges(result.data.changes);
      setIsVerifyingOtp(true);
      return {
        needsOtp: true,
        targetEmail: result.data.targetEmail,
        changes: result.data.changes,
      };
    } catch (err) {
      handleApiError(err);
      return false;
    } finally {
      setIsSavingInfo(false);
    }
  };

  const verifyOtp = async (otp: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const response = await usersAPI.verifyUpdateOtp({ otp });
      const updatedUser = response.data?.data; // TransformInterceptor spreads: { statusCode, message, data: UserEntity }

      // Đồng bộ Redux
      dispatch(patchUser({
        userName: updatedUser?.userName,
        email: updatedUser?.email,
        description: updatedUser?.description,
      }));

      toast.success('Profile updated successfully');
      setIsVerifyingOtp(false);
      setOtpTargetEmail('');
      setOtpChanges([]);
      return true;
    } catch (err) {
      handleApiError(err);
      return false;
    }
  };

  const cancelOtp = () => {
    setIsVerifyingOtp(false);
    setOtpTargetEmail('');
    setOtpChanges([]);
    toast.info('Profile update cancelled');
  };

  const uploadImage = async (file: File, typeImg: ImageType): Promise<boolean> => {
    if (!user) return false;

    const validationError = validateImage(file);
    if (validationError) {
      toast.error(validationError);
      return false;
    }

    const formData = new FormData();
    formData.append('imgProfile', file);
    formData.append('typeImg', typeImg);

    setIsUploadingImg(typeImg);
    try {
      const response = await usersAPI.uploadAvatarOrBg(user.id, formData);
      const data = response.data?.data;

      // Backend trả về user đã update — đồng bộ field tương ứng vào Redux
      if (typeImg === IMAGE_TYPES.AVATAR) {
        dispatch(patchUser({ avatarUrl: data?.avatarUrl ?? null }));
        toast.success('Avatar updated successfully');
      } else {
        dispatch(patchUser({ backgroundUrl: data?.backgroundUrl ?? null }));
        toast.success('Background updated successfully');
      }
      return true;
    } catch (err) {
      handleApiError(err);
      return false;
    } finally {
      setIsUploadingImg(null);
    }
  };

  return {
    user,
    isSavingInfo,
    isVerifyingOtp,
    otpTargetEmail,
    otpChanges,
    isUploadingImg,
    saveInfo,
    verifyOtp,
    cancelOtp,
    uploadImage,
  };
}
