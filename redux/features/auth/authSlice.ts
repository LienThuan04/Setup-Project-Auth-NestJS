import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '@/lib/axios/api';
import { ensureDeviceId } from '@/lib/cookie';
import { toast } from 'sonner';
import { IUser } from '@/components/ManagerUsers/user-schema';
import { tokenStore } from '@/lib/auth/token-store';

interface AuthState {
    accessToken: string | null;
    user: IUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    isInitialized: boolean; // Đã check token lần đầu chưa
}

const initialState: AuthState = {
    accessToken: null,
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    isInitialized: false, // Mặc định chưa check token, sẽ được set true sau khi refreshToken hoặc getProfile hoàn thành (dù thành công hay thất bại)
};

// Login thunk
export const loginUser = createAsyncThunk(
    'auth/login',
    async (data: { userNameOrEmail: string; password: string }, { rejectWithValue }) => {
        try {
            ensureDeviceId(); // Đảm bảo deviceId tồn tại trước khi login
            const response = await authAPI.login(data);
            const payload = response.data?.data; // { accessToken, user }
            // Cập nhật tokenStore để axios interceptor có thể đọc được token ngay sau login
            if (payload?.accessToken) {
                tokenStore.set(payload.accessToken);
            }
            toast.success(response.data?.message || 'Login successful!');
            return payload;
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Login failed');
            return rejectWithValue(error.response?.data?.message || 'Login failed');
        }
    }
);

export const refreshToken = createAsyncThunk(
    'auth/refreshToken',
    async (_, { rejectWithValue }) => {
        try {
            const response = await authAPI.refreshToken();
            const payload = response.data?.data; // { accessToken, user }
            if (payload?.accessToken) {
                tokenStore.set(payload.accessToken);
            }
            return payload;
        } catch (error: any) {
            // Không show toast ở lần đầu refresh, chỉ show khi user đang dùng
            console.log('No valid session:', error.response?.data?.message);
            return rejectWithValue('Session expired');
        }
    }
);

export const getProfile = createAsyncThunk(
    'auth/getProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await authAPI.getProfile();
            return response.data?.data; // { user }
        } catch (error: any) {
            toast.error('Failed to fetch profile.');
            return rejectWithValue('Failed to fetch profile');
        }
    }
);

export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await authAPI.logout();
            tokenStore.clear(); // Xóa token khỏi module store
            toast.success('Đăng xuất thành công!');
        } catch (error: any) {
            toast.error('Đăng xuất thất bại.');
            return rejectWithValue('Đăng xuất thất bại');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    // Reducers thuần để clear auth hoặc set token/user trực tiếp (dùng trong refresh token)
    reducers: {
        clearAuth: (state) => {
            state.accessToken = null;
            state.user = null;
            state.isAuthenticated = false;
            state.isLoading = false;
            state.error = null;
            state.isInitialized = true;
        },
        setAccessTokenAndUser: (state, action) => {
            state.accessToken = action.payload.accessToken;
            state.isAuthenticated = !!action.payload.accessToken;
            state.isInitialized = true;
            // Chỉ cập nhật user nếu được truyền rõ ràng (tokenStore subscriber truyền null)
            if (action.payload.user) {
                state.user = action.payload.user;
            }
        },
    },
    // Xử lý các async thunk
    extraReducers: (builder) => {
        builder

            // Login
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.accessToken = action.payload.accessToken;
                state.user = action.payload.user;
                state.isAuthenticated = true;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Refresh token
            .addCase(refreshToken.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(refreshToken.fulfilled, (state, action) => {
                state.isLoading = false;
                state.accessToken = action.payload.accessToken;
                state.user = action.payload.user;
                state.isAuthenticated = true;
                state.isInitialized = true;
            })
            .addCase(refreshToken.rejected, (state, action) => {
                state.isLoading = false;
                state.accessToken = null;
                state.user = null;
                state.isAuthenticated = false;
                state.error = action.payload as string;
                state.isInitialized = true;
            })

            // Get profile
            .addCase(getProfile.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.isAuthenticated = true;
                state.isInitialized = true; // Đảm bảo isInitialized = true dù getProfile chạy trước refreshToken
            })
            .addCase(getProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
                state.isInitialized = true; // Tránh app bị loading mãi mãi
            })

            // Logout
            .addCase(logout.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(logout.fulfilled, (state) => {
                state.accessToken = null;
                state.user = null;
                state.isAuthenticated = false;
                state.isLoading = false;
                state.error = null;
                state.isInitialized = true;
            })
            .addCase(logout.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearAuth, setAccessTokenAndUser } = authSlice.actions;
export const authReducer = authSlice.reducer;