"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, type Ticket as TicketType, TicketStatus } from "@/lib/api";
import { useTicketEvents } from "@/hooks/useTicketEvents";
import { TicketListSkeleton } from "@/components/ui/Skeleton";
import TicketForm from "@/components/TicketForm";
import { Ticket } from "@/components/ticket";
import {
    AlertCircle,
    Clock,
    CheckCircle2,
    MessageSquare,
    Plus
} from "lucide-react";

export default function CustomerDashboard() {
    const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    // Enable real-time updates
    useTicketEvents();

    const { data, isLoading, error } = useQuery({
        queryKey: ["tickets"],
        queryFn: api.getTickets,
    });

    const tickets = data?.tickets || [];

    const getStatusIcon = (ticket: TicketType) => {
        if (ticket.resolved) return <CheckCircle2 className="w-5 h-5 text-[var(--color-success-600)]" />;
        if (ticket.status === TicketStatus.PROCESSING) return <Clock className="w-5 h-5 text-[var(--color-primary-600)] animate-pulse" />;
        if (ticket.status === TicketStatus.PENDING) return <Clock className="w-5 h-5 text-[var(--color-warning-600)]" />;
        return <MessageSquare className="w-5 h-5 text-[var(--color-primary-600)]" />;
    };

    const getStatusLabel = (ticket: TicketType) => {
        if (ticket.resolved) return "Resolved";
        if (ticket.status === TicketStatus.PROCESSING) return "Processing";
        if (ticket.status === TicketStatus.PENDING) return "Pending";
        if (ticket.status === TicketStatus.COMPLETED) return "Awaiting Response";
        return ticket.status;
    };

    const handleTicketCreated = () => {
        setShowForm(false);
        setRefreshKey(prev => prev + 1);
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">My Tickets</h1>
                <TicketListSkeleton count={3} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-6 bg-[var(--color-danger-50)] border border-[var(--color-danger-500)] rounded-lg text-[var(--color-danger-700)]">
                <AlertCircle className="w-5 h-5 inline mr-2" />
                {error instanceof Error ? error.message : "Failed to load tickets"}
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6" key={refreshKey}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">My Tickets</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn btn-primary"
                >
                    <Plus className="w-5 h-5" />
                    New Ticket
                </button>
            </div>

            {/* New Ticket Form */}
            {showForm && (
                <div className="card p-6">
                    <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
                        Submit a Support Request
                    </h2>
                    <TicketForm onTicketCreated={handleTicketCreated} />
                </div>
            )}

            {/* Ticket List */}
            {tickets.length === 0 ? (
                <div className="card p-12 text-center">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-[var(--text-tertiary)]" />
                    <p className="text-[var(--text-secondary)] mb-4">
                        You don&apos;t have any support tickets yet
                    </p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="btn btn-primary"
                    >
                        <Plus className="w-5 h-5" />
                        Create Your First Ticket
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {tickets.map((ticket) => (
                        <div
                            key={ticket.id}
                            onClick={() => setSelectedTicket(ticket)}
                            className="card card-interactive p-6 cursor-pointer"
                        >
                            <div className="flex items-start gap-4">
                                <div className="mt-1">
                                    {getStatusIcon(ticket)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`badge ${ticket.resolved ? 'badge-resolved' : 'badge-' + ticket.status}`}>
                                            {getStatusLabel(ticket)}
                                        </span>
                                        {ticket.category && (
                                            <span className="badge badge-completed">
                                                {ticket.category}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[var(--text-primary)] line-clamp-2 mb-2">
                                        {ticket.raw_content}
                                    </p>
                                    <p className="text-sm text-[var(--text-tertiary)]">
                                        {new Date(ticket.created_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

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
                    </Ticket.Frame>
                </Ticket.Provider>
            )}
        </div>
    );
}
