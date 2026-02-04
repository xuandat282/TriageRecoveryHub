"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/store/hooks";
import { UserRole } from "@/types/auth";
import { api, type Ticket, TicketStatus } from "@/lib/api";
import { useTicketEvents } from "@/hooks/useTicketEvents";
import TicketCard from "./TicketCard";
import TicketDetail from "./TicketDetail";
import { User } from "lucide-react";

type FilterType = "all" | "pending" | "processing" | "completed" | "resolved";

export default function TicketList() {
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [filter, setFilter] = useState<FilterType>("all");
    const { user } = useAppSelector((state) => state.auth);

    // Enable real-time updates via SSE
    useTicketEvents();

    const { data, isLoading, error } = useQuery({
        queryKey: ["tickets"],
        queryFn: api.getTickets,
        // No polling needed - SSE handles updates!
    });

    // Filter tickets based on user role and filter selection
    const filteredTickets = data?.tickets.filter((ticket) => {
        // Role-based filtering is handled by backend
        // Customers only see their own tickets
        // Agents/Admins see all tickets

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

    const isAgent = user?.role === UserRole.AGENT || user?.role === UserRole.ADMIN;

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error instanceof Error ? error.message : "Failed to fetch tickets"}
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">
                            {isAgent ? "All Tickets" : "My Tickets"}
                        </h2>
                        {!isAgent && (
                            <p className="text-sm text-slate-500 mt-1">
                                <User className="w-4 h-4 inline mr-1" />
                                Viewing your submitted tickets
                            </p>
                        )}
                    </div>
                    <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                        {data?.total || 0} Total
                    </span>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {(["all", "pending", "processing", "completed", "resolved"] as FilterType[]).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === f
                                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)} ({getFilterCount(f)})
                        </button>
                    ))}
                </div>

                {/* Ticket List */}
                {filteredTickets.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="font-medium text-slate-700 mb-1">
                            {filter === "all"
                                ? "No tickets yet"
                                : `No ${filter} tickets`}
                        </p>
                        <p className="text-sm text-slate-500">
                            {filter === "all" && !isAgent
                                ? "Submit your first support ticket to get started"
                                : `No tickets match the ${filter} filter`}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
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
