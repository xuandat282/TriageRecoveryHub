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

export const api = {
    async createTicket(data: TicketCreateRequest): Promise<Ticket> {
        const response = await fetch(`${API_URL}/tickets`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error("Failed to create ticket");
        }

        return response.json();
    },

    async getTickets(): Promise<TicketListResponse> {
        const response = await fetch(`${API_URL}/tickets`);

        if (!response.ok) {
            throw new Error("Failed to fetch tickets");
        }

        return response.json();
    },

    async getTicket(id: string): Promise<Ticket> {
        const response = await fetch(`${API_URL}/tickets/${id}`);

        if (!response.ok) {
            throw new Error("Failed to fetch ticket");
        }

        return response.json();
    },

    async updateTicket(id: string, data: TicketUpdateRequest): Promise<Ticket> {
        const response = await fetch(`${API_URL}/tickets/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
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
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("Failed to resolve ticket");
        }

        return response.json();
    },
};
