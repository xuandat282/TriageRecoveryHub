/**
 * Redux Toolkit auth slice
 * Manages authentication state and actions
 */

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, User, LoginCredentials } from "@/types/auth";
import { authApi } from "@/lib/api";

// Initial state
const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
    "auth/login",
    async (credentials: LoginCredentials, { rejectWithValue }) => {
        try {
            const authResponse = await authApi.login(credentials);
            const user = await authApi.getCurrentUser(authResponse.access_token);

            // Store token in localStorage
            localStorage.setItem("auth_token", authResponse.access_token);

            return { user, token: authResponse.access_token };
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.detail || "Login failed. Please check your credentials."
            );
        }
    }
);

export const loadUserFromToken = createAsyncThunk(
    "auth/loadUser",
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("auth_token");

            if (!token) {
                return rejectWithValue("No token found");
            }

            const user = await authApi.getCurrentUser(token);
            return { user, token };
        } catch (error: any) {
            // Clear invalid token
            localStorage.removeItem("auth_token");
            return rejectWithValue("Invalid or expired token");
        }
    }
);

// Auth slice
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.error = null;
            localStorage.removeItem("auth_token");
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Login
        builder
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Load user from token
        builder
            .addCase(loadUserFromToken.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(loadUserFromToken.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
            })
            .addCase(loadUserFromToken.rejected, (state) => {
                state.isLoading = false;
                state.isAuthenticated = false;
            });
    },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
