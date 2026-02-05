"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { api, type Ticket as TicketType, TicketStatus } from "@/lib/api";
import { useTicketEvents } from "@/hooks/useTicketEvents";
import { TicketListSkeleton } from "@/components/ui/Skeleton";
import { Ticket } from "@/components/ticket";
import TicketCard from "./TicketCard";

type FilterType = "all" | "pending" | "processing" | "completed" | "resolved";

export default function TicketList() {
    const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
    const [filter, setFilter] = useState<FilterType>("all");

    // Enable real-time updates via SSE
    useTicketEvents();

    const { data, isLoading, error } = useQuery({
        queryKey: ["tickets"],
        queryFn: api.getTickets,
    });

    const filteredTickets = data?.tickets.filter((ticket) => {
        switch (filter) {
            case "pending":
                return ticket.status === TicketStatus.PENDING;
            case "processing":
                return ticket.status === TicketStatus.PROCESSING;
            case "completed":
                return ticket.status === TicketStatus.COMPLETED && !ticket.resolved;
            case "resolved":
                return ticket.resolved;
            default:
                return true;
        }
    }) || [];

    const getFilterCount = (filterType: FilterType) => {
        if (!data?.tickets) return 0;

        switch (filterType) {
            case "pending":
                return data.tickets.filter(t => t.status === TicketStatus.PENDING).length;
            case "processing":
                return data.tickets.filter(t => t.status === TicketStatus.PROCESSING).length;
            case "completed":
                return data.tickets.filter(t => t.status === TicketStatus.COMPLETED && !t.resolved).length;
            case "resolved":
                return data.tickets.filter(t => t.resolved).length;
            default:
                return data.tickets.length;
        }
    };

    if (isLoading) {
        return (
            <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                        Agent Dashboard
                    </h2>
                </div>
                <TicketListSkeleton count={3} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="card p-6">
                <div
                    className="bg-[var(--color-danger-50)] border border-[var(--color-danger-500)] text-[var(--color-danger-700)] px-4 py-3 rounded-lg"
                    role="alert"
                >
                    {error instanceof Error ? error.message : "Failed to fetch tickets"}
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                        Agent Dashboard
                    </h2>
                    <span className="text-sm text-[var(--text-secondary)]">
                        Total: {data?.total || 0}
                    </span>
                </div>

                {/* Filters */}
                <div
                    className="flex flex-wrap gap-2 mb-6"
                    role="group"
                    aria-label="Filter tickets"
                >
                    {(["all", "pending", "processing", "completed", "resolved"] as FilterType[]).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`btn ${filter === f ? "btn-primary" : "btn-secondary"}`}
                            aria-pressed={filter === f}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)} ({getFilterCount(f)})
                        </button>
                    ))}
                </div>

                {/* Ticket List with aria-live for real-time updates */}
                <div aria-live="polite" aria-atomic="false">
                    {filteredTickets.length === 0 ? (
                        <div className="text-center py-12 text-[var(--text-tertiary)]">
                            {filter === "all"
                                ? "No tickets yet. Submit your first ticket!"
                                : `No ${filter} tickets found.`}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredTickets.map((ticket) => (
                                <TicketCard
                                    key={ticket.id}
                                    ticket={ticket}
                                    onClick={() => setSelectedTicket(ticket)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Compound Ticket Detail Modal */}
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
        </>
    );
}
