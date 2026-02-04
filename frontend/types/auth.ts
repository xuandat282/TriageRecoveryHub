/**
 * Authentication type definitions
 */

export interface User {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
    is_active: boolean;
    created_at: string;
}

export enum UserRole {
    CUSTOMER = "customer",
    AGENT = "agent",
    ADMIN = "admin",
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    full_name: string;
    role?: UserRole;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}
