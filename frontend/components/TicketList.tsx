"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, type Ticket, TicketStatus } from "@/lib/api";
import TicketCard from "./TicketCard";
import TicketDetail from "./TicketDetail";

type FilterType = "all" | "pending" | "processing" | "completed" | "resolved";

export default function TicketList() {
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [filter, setFilter] = useState<FilterType>("all");

    const { data, isLoading, error } = useQuery({
        queryKey: ["tickets"],
        queryFn: api.getTickets,
        refetchInterval: (query) => {
            // Smart polling: only poll if there are pending/processing tickets
            const hasPendingOrProcessing = query.state.data?.tickets.some(
                (t) => t.status === TicketStatus.PENDING || t.status === TicketStatus.PROCESSING
            );
            return hasPendingOrProcessing ? 3000 : false; // Poll every 3s or stop
        },
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
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error instanceof Error ? error.message : "Failed to fetch tickets"}
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Agent Dashboard</h2>
                    <span className="text-sm text-gray-600">
                        Total: {data?.total || 0}
                    </span>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {(["all", "pending", "processing", "completed", "resolved"] as FilterType[]).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === f
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)} ({getFilterCount(f)})
                        </button>
                    ))}
                </div>

                {/* Ticket List */}
                {filteredTickets.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
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

            {/* Ticket Detail Modal */}
            {selectedTicket && (
                <TicketDetail
                    ticket={selectedTicket}
                    onClose={() => setSelectedTicket(null)}
                />
            )}
        </>
    );
}
