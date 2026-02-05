"use client";

import { useQuery } from "@tanstack/react-query";
import { api, type Ticket as TicketType, TicketStatus } from "@/lib/api";
import { useTicketEvents } from "@/hooks/useTicketEvents";
import { TicketListSkeleton } from "@/components/ui/Skeleton";
import { useState } from "react";
import { Ticket } from "@/components/ticket";
import {
    AlertCircle,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Inbox
} from "lucide-react";

export default function AgentDashboard() {
    const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);

    // Enable real-time updates
    useTicketEvents();

    const { data, isLoading, error } = useQuery({
        queryKey: ["tickets"],
        queryFn: api.getTickets,
    });

    // Filter unresolved tickets for triage queue
    const triageQueue = data?.tickets.filter(
        t => t.status === TicketStatus.COMPLETED && !t.resolved
    ) || [];

    const pendingCount = data?.tickets.filter(t => t.status === TicketStatus.PENDING).length || 0;
    const processingCount = data?.tickets.filter(t => t.status === TicketStatus.PROCESSING).length || 0;

    const getUrgencyColor = (urgency: string | null) => {
        switch (urgency?.toLowerCase()) {
            case "critical": return "text-[var(--color-danger-600)]";
            case "high": return "text-[var(--color-orange-600)]";
            case "medium": return "text-[var(--color-warning-600)]";
            case "low": return "text-[var(--color-success-600)]";
            default: return "text-[var(--text-tertiary)]";
        }
    };

    const getUrgencyBadge = (urgency: string | null) => {
        switch (urgency?.toLowerCase()) {
            case "critical": return "badge-critical";
            case "high": return "badge-high";
            case "medium": return "badge-medium";
            case "low": return "badge-low";
            default: return "badge-pending";
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">Triage Queue</h1>
                <TicketListSkeleton count={5} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-[var(--color-danger-50)] border border-[var(--color-danger-500)] rounded-lg text-[var(--color-danger-700)]">
                <AlertCircle className="w-5 h-5 inline mr-2" />
                {error instanceof Error ? error.message : "Failed to load tickets"}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">Triage Queue</h1>
                <div className="flex items-center gap-4 text-sm">
                    {pendingCount > 0 && (
                        <span className="flex items-center gap-1 text-[var(--color-warning-600)]">
                            <Clock className="w-4 h-4" />
                            {pendingCount} pending
                        </span>
                    )}
                    {processingCount > 0 && (
                        <span className="flex items-center gap-1 text-[var(--color-primary-600)]">
                            <span className="spinner w-4 h-4" />
                            {processingCount} processing
                        </span>
                    )}
                </div>
            </div>

            {/* Triage Queue */}
            <div className="grid gap-4">
                {triageQueue.length === 0 ? (
                    <div className="card p-12 text-center">
                        <Inbox className="w-12 h-12 mx-auto mb-4 text-[var(--text-tertiary)]" />
                        <p className="text-[var(--text-secondary)]">
                            No tickets awaiting review
                        </p>
                    </div>
                ) : (
                    triageQueue.map((ticket) => (
                        <div
                            key={ticket.id}
                            onClick={() => setSelectedTicket(ticket)}
                            className="card card-interactive p-6 cursor-pointer"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`badge ${getUrgencyBadge(ticket.urgency)}`}>
                                            {ticket.urgency || "Unknown"}
                                        </span>
                                        <span className="badge badge-completed">
                                            {ticket.category || "General"}
                                        </span>
                                    </div>
                                    <p className="text-[var(--text-primary)] line-clamp-2 mb-2">
                                        {ticket.raw_content}
                                    </p>
                                    <p className="text-sm text-[var(--text-tertiary)]">
                                        {new Date(ticket.created_at).toLocaleString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className={`text-2xl font-bold ${getUrgencyColor(ticket.urgency)}`}>
                                        {ticket.sentiment_score !== null ? `${ticket.sentiment_score}/10` : "—"}
                                    </div>
                                    <div className="text-xs text-[var(--text-tertiary)]">Sentiment</div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Ticket Detail Modal */}
            {selectedTicket && (
                <Ticket.Provider
                    ticket={selectedTicket}
                    onClose={() => setSelectedTicket(null)}
                >
                    <Ticket.Frame>
                        <Ticket.Header />
                        <Ticket.Content />
                        <Ticket.Response />
                        <Ticket.Actions />
                    </Ticket.Frame>
                </Ticket.Provider>
            )}
        </div>
    );
}
