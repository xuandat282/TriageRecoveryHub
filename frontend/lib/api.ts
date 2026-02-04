import type { User, LoginCredentials, AuthResponse } from "@/types/auth";

// API types and interfaces
export enum TicketStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed",
}

export interface Ticket {
    id: string;
    raw_content: string;
    status: TicketStatus;
    category: string | null;
    urgency: string | null;
    sentiment_score: number | null;
    draft_response: string | null;
    created_at: string;
    created_by: string | null;
    resolved: boolean;
    resolved_at: string | null;
    resolved_by: string | null;
}

export interface TicketCreateRequest {
    raw_content: string;
}

export interface TicketUpdateRequest {
    draft_response?: string;
    category?: string;
    urgency?: string;
}

export interface TicketListResponse {
    tickets: Ticket[];
    total: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Get authorization headers with JWT token
 */
function getAuthHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };

    // Get token from localStorage if not provided
    const authToken = token || (typeof window !== "undefined" ? localStorage.getItem("auth_token") : null);

    if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
    }

    return headers;
}

/**
 * Authentication API
 */
export const authApi = {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Login failed");
        }

        return response.json();
    },

    async getCurrentUser(token: string): Promise<User> {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: getAuthHeaders(token),
        });

        if (!response.ok) {
            throw new Error("Failed to fetch user");
        }

        return response.json();
    },

    async register(data: { email: string; password: string; full_name: string; role?: string }): Promise<User> {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Registration failed");
        }

        return response.json();
    },
};

/**
 * Ticket API
 */
export const api = {
    async createTicket(data: TicketCreateRequest): Promise<Ticket> {
        const response = await fetch(`${API_URL}/tickets`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error("Failed to create ticket");
        }

        return response.json();
    },

    async getTickets(): Promise<TicketListResponse> {
        const response = await fetch(`${API_URL}/tickets`, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error("Failed to fetch tickets");
        }

        return response.json();
    },

    async getTicket(id: string): Promise<Ticket> {
        const response = await fetch(`${API_URL}/tickets/${id}`, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error("Failed to fetch ticket");
        }

        return response.json();
    },

    async updateTicket(id: string, data: TicketUpdateRequest): Promise<Ticket> {
        const response = await fetch(`${API_URL}/tickets/${id}`, {
            method: "PATCH",
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error("Failed to update ticket");
        }

        return response.json();
    },

    async resolveTicket(id: string): Promise<Ticket> {
        const response = await fetch(`${API_URL}/tickets/${id}/resolve`, {
            method: "POST",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error("Failed to resolve ticket");
        }

        return response.json();
    },
};
