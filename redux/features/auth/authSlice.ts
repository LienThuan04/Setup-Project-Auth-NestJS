import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '@/lib/axios/api';
import { ensureDeviceId } from '@/lib/cookie';
import { User } from '@/redux/types';
import { toast } from 'sonner';

interface AuthState {
    accessToken: string | null;
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    accessToken: null,
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
};

// Login thunk
export const loginUser = createAsyncThunk(
    'auth/login',
    async (data: { userNameOrEmail: string; password: string }, { rejectWithValue }) => {
        try {
            ensureDeviceId(); // Đảm bảo deviceId tồn tại trước khi login
            const response = await authAPI.login(data);
            toast.success(response.data?.message || 'Login successful!');
            return response.data?.data; // { accessToken, user }
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
            return response.data?.data; // { accessToken, user }
        } catch (error: any) {
            toast.error('Session expired. Please log in again.');
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
            toast.success('Logged out successfully!');
            window.location.href = '/login'; // Redirect to login page after logout
        } catch (error: any) {
            toast.error('Logout failed.');
            return rejectWithValue('Logout failed');
        }
    }
);



const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearAuth: () => initialState,
        setAccessTokenAndUser: (state, action) => {
            state.accessToken = action.payload.accessToken;
            if (action.payload.user) {
            state.user = action.payload.user;
            }
        }
    },
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
            })
            .addCase(refreshToken.rejected, (state, action) => {
                state.isLoading = false;
                state.accessToken = null;
                state.user = null;
                state.isAuthenticated = false;
                state.error = action.payload as string;
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
            })
            .addCase(getProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Logout
            .addCase(logout.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(logout.fulfilled, () => initialState)
            .addCase(logout.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearAuth, setAccessTokenAndUser } = authSlice.actions;
export const authReducer = authSlice.reducer;