import axiosInstance from '@/lib/axios/axios';

// ==================== AUTH APIs ====================
export const authAPI = {
    // Register (bước 1 - gửi OTP)
    register: (data: { userName: string; email: string; password: string }) =>
        axiosInstance.post('/auth/register', data),

    // Verify OTP sau register (bước 2)
    verifyRegisterOtp: (data: { email: string; otp: string }) =>
        axiosInstance.post('/auth/verify-register-otp', data),

    // Resend OTP sau register
    resendRegisterOtp: (data: { email: string }) =>
        axiosInstance.post('/auth/resend-register-otp', data),

    // Login (dùng userName hoặc email)
    login: (data: { userNameOrEmail: string; password: string }) =>
        axiosInstance.post('/auth/login', data),

    // Refresh token
    refreshToken: () =>
        axiosInstance.post('/auth/refresh'),

    // Get profile user hiện tại
    getProfile: () =>
        axiosInstance.get('/auth/profile'),

    // Logout
    logout: () =>
        axiosInstance.post('/auth/logout'),

    // Logout tất cả thiết bị
    logoutAll: () =>
        axiosInstance.post('/auth/logout-all'),

    // Google Login (redirect)
    googleLogin: () => {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
    },

    // Change password
    // authAPI
    changePasswordSendOtp: (data: { email: string }) =>
        axiosInstance.post('/auth/change-password/send-otp', data),

    // Bước 2: xác thực OTP — server set httpOnly cookie với reset token, trả về { expiresIn }
    changePasswordVerifyOtp: (data: { email: string; otp: string }) =>
        axiosInstance.post('/auth/change-password/verify-otp', data),

    // Bước 3: đặt mật khẩu mới — cookie reset token tự gửi nhờ withCredentials
    changePasswordReset: (data: { newPassword: string }) =>
        axiosInstance.post('/auth/change-password/reset', data),

};

// ==================== USERS APIs ====================
export const usersAPI = {
    // Lấy tất cả users (paginated)
    getAll: (params?: { page?: number; limit?: number; search?: string; roleName?: string; sortBy?: string; order?: 'asc' | 'desc' }) =>
        axiosInstance.get('/users', { params }),

    // Tạo user mới
    create: (data: {
        email: string;
        password: string;
        userName: string;
        roleName: string;
    }) => axiosInstance.post('/users', data),

    // Lấy user theo ID
    getById: (id: string) =>
        axiosInstance.get(`/users/${id}`),

    // Admin: Cập nhật user trực tiếp (không OTP, yêu cầu quyền admin)
    update: (id: string, data: {
        email?: string;
        userName?: string;
        description?: string;
    }) => axiosInstance.patch(`/users/${id}`, data),

    // Cập nhật profile (OTP-flow, dành cho user tự sửa)
    requestUpdateOtp: (data: {
        email?: string;
        userName?: string;
        description?: string;
    }) => axiosInstance.post('/users/update-profile/request-otp', data),

    verifyUpdateOtp: (data: { otp: string }) =>
        axiosInstance.post('/users/update-profile/verify-otp', data),

    // Cập nhật role của user (admin)
    updateRole: (id: string, data: { roleNameOrId: string }) =>
        axiosInstance.patch(`/users/role/${id}`, data),

    // Xóa user
    delete: (id: string) =>
        axiosInstance.delete(`/users/${id}`),

    // Upload avatar hoặc background
    uploadAvatarOrBg: (id: string, data: FormData) =>
        axiosInstance.patch(`/users/avatarorbg/${id}`, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),
};

// ==================== ROLE APIs ====================
export const rolesAPI = {
    // Lấy tất cả roles (paginated)
    getAll: (params?: { page?: number; limit?: number; search?: string; sortBy?: string; order?: 'asc' | 'desc' }) =>
        axiosInstance.get('/role', { params }),

    // Tạo role mới
    create: (data: { roleName: string; description: string }) =>
        axiosInstance.post('/role', data),

    // Lấy role theo ID
    getById: (id: string) =>
        axiosInstance.get(`/role/${id}`),

    // Cập nhật role
    update: (id: string, data: { roleName?: string; description?: string }) =>
        axiosInstance.patch(`/role/${id}`, data),

    // Xóa role
    delete: (id: string) =>
        axiosInstance.delete(`/role/${id}`),
};

