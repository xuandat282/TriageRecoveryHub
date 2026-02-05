// Auth types and API functions
export interface User {
    id: string;
    email: string;
    name: string;
    role: 'customer' | 'agent' | 'admin';
    plan: string | null;
    created_at: string;
    is_active: boolean;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    name: string;
    role?: 'customer' | 'agent' | 'admin';
    plan?: string;
}

export interface TokenResponse {
    access_token: string;
    token_type: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Token storage key
const TOKEN_KEY = 'auth_token';

export const authApi = {
    // Store token
    setToken(token: string) {
        if (typeof window !== 'undefined') {
            localStorage.setItem(TOKEN_KEY, token);
        }
    },

    // Get token
    getToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(TOKEN_KEY);
        }
        return null;
    },

    // Clear token
    clearToken() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(TOKEN_KEY);
        }
    },

    // Get auth headers
    getAuthHeaders(): HeadersInit {
        const token = this.getToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
    },

    // Register new user
    async register(data: RegisterData): Promise<User> {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Registration failed");
        }

        return response.json();
    },

    // Login
    async login(credentials: LoginCredentials): Promise<TokenResponse> {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Login failed");
        }

        const data: TokenResponse = await response.json();
        this.setToken(data.access_token);
        return data;
    },

    // Get current user
    async getCurrentUser(): Promise<User | null> {
        const token = this.getToken();
        if (!token) return null;

        try {
            const response = await fetch(`${API_URL}/auth/me`, {
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.clearToken();
                    return null;
                }
                throw new Error("Failed to get user");
            }

            return response.json();
        } catch {
            return null;
        }
    },

    // Logout
    logout() {
        this.clearToken();
    },
};
