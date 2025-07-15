import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../api/api';
import { setItem, removeItem, getItem } from '../../utils/storage';

const handleApiError = (error) => {
    // Check if it's a server response error or a network/other error
    if (error.response && error.response.data && error.response.data.message) {
        return error.response.data.message;
    }
    // For network errors or other issues where there's no response body
    return error.message || 'An unexpected error occurred';
};

export const login = createAsyncThunk('auth/login', async (userData, { rejectWithValue }) => {
    try {
        const { data } = await api.loginUser(userData);
        await setItem('userToken', data.token);
        return data;
    } catch (error) {
        // Use the robust error handler
        return rejectWithValue(handleApiError(error));
    }
});

export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
    try {
        const { data } = await api.registerUser(userData);
        await setItem('userToken', data.token);
        return data;
    } catch (error) {
        // Use the robust error handler here as well
        return rejectWithValue(handleApiError(error));
    }
});

export const checkAuth = createAsyncThunk('auth/checkAuth', async (_, { rejectWithValue }) => {
    const token = await getItem('userToken');
    if (!token) {
        return rejectWithValue('No token found');
    }
    return token;
});

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: true,
        error: null,
        userRole: null,
    },
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.userRole = null;
            removeItem('userToken');
        },
        setUserRole: (state, action) => {
            state.userRole = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Handle Login
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.userRole = action.payload.user.role;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Handle Register
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.userRole = action.payload.user.role;
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Handle Initial Auth Check
            .addCase(checkAuth.pending, (state) => {
                state.loading = true;
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.token = action.payload;
                state.isAuthenticated = true;
                state.loading = false;
            })
            .addCase(checkAuth.rejected, (state) => {
                state.loading = false;
                state.isAuthenticated = false;
            });
    },
});

export const { logout, setUserRole } = authSlice.actions;
export default authSlice.reducer;