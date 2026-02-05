"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/store/hooks";
import { UserRole } from "@/types/auth";
import { api, type Ticket, TicketStatus } from "@/lib/api";
import { useTicketEvents } from "@/hooks/useTicketEvents";
import TicketDetail from "./TicketDetail";
import { User, ChevronLeft, ChevronRight } from "lucide-react";
import { truncate, formatRelativeTime, generatePageNumbers } from "@/lib/utils";

type FilterType = "all" | "pending" | "processing" | "completed" | "resolved";

export default function TicketList() {
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [filter, setFilter] = useState<FilterType>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const { user } = useAppSelector((state) => state.auth);

    // Enable real-time updates via SSE
    useTicketEvents();

    const { data, isLoading, error } = useQuery({
        queryKey: ["tickets"],
        queryFn: api.getTickets,
    });

    // Filter tickets based on user role and filter selection
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

    // Pagination calculations
    const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredTickets.length);
    const paginatedTickets = filteredTickets.slice(startIndex, endIndex);
    const pageNumbers = generatePageNumbers(currentPage, totalPages);

    // Reset to page 1 when filter changes
    const handleFilterChange = (newFilter: FilterType) => {
        setFilter(newFilter);
        setCurrentPage(1);
    };

    const handleItemsPerPageChange = (value: number) => {
        setItemsPerPage(value);
        setCurrentPage(1);
    };

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

    const getStatusBadge = (ticket: Ticket) => {
        if (ticket.resolved) {
            return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">Resolved</span>;
        }

        const badges = {
            [TicketStatus.PENDING]: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Pending" },
            [TicketStatus.PROCESSING]: { bg: "bg-blue-100", text: "text-blue-700", label: "Processing" },
            [TicketStatus.COMPLETED]: { bg: "bg-green-100", text: "text-green-700", label: "Completed" },
            [TicketStatus.FAILED]: { bg: "bg-red-100", text: "text-red-700", label: "Failed" },
        };

        const badge = badges[ticket.status];
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
                {badge.label}
            </span>
        );
    };

    const getUrgencyBadge = (urgency: string | null) => {
        if (!urgency) return <span className="text-slate-400 text-sm">-</span>;

        const badges: Record<string, { bg: string; text: string }> = {
            "high": { bg: "bg-red-100", text: "text-red-700" },
            "medium": { bg: "bg-orange-100", text: "text-orange-700" },
            "low": { bg: "bg-green-100", text: "text-green-700" },
        };

        const badge = badges[urgency.toLowerCase()] || { bg: "bg-slate-100", text: "text-slate-700" };
        return (
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${badge.bg} ${badge.text}`}>
                {urgency}
            </span>
        );
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
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center justify-between mb-4">
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
                            {filteredTickets.length} {filter !== "all" ? filter : "total"}
                        </span>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-2">
                        {(["all", "pending", "processing", "completed", "resolved"] as FilterType[]).map((f) => (
                            <button
                                key={f}
                                onClick={() => handleFilterChange(f)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${filter === f
                                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                    }`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)} ({getFilterCount(f)})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                {filteredTickets.length === 0 ? (
                    <div className="text-center py-16 px-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="font-medium text-slate-700 mb-1">
                            {filter === "all" ? "No tickets yet" : `No ${filter} tickets`}
                        </p>
                        <p className="text-sm text-slate-500">
                            {filter === "all" && !isAgent
                                ? "Submit your first support ticket to get started"
                                : `No tickets match the ${filter} filter`}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            Content
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            Urgency
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            Created
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {paginatedTickets.map((ticket) => (
                                        <tr
                                            key={ticket.id}
                                            onClick={() => setSelectedTicket(ticket)}
                                            className="hover:bg-slate-50 cursor-pointer transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-mono text-slate-600">
                                                    {ticket.id.slice(0, 8)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-slate-900 max-w-md">
                                                    {truncate(ticket.raw_content, 80)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {ticket.category ? (
                                                    <span className="text-sm text-slate-700">
                                                        {ticket.category}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-slate-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getUrgencyBadge(ticket.urgency)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(ticket)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                {formatRelativeTime(ticket.created_at)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                                {/* Items per page */}
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-slate-600">Show</span>
                                    <select
                                        value={itemsPerPage}
                                        onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                                        className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                    </select>
                                    <span className="text-sm text-slate-600">per page</span>
                                </div>

                                {/* Page info */}
                                <div className="text-sm text-slate-600">
                                    Showing {startIndex + 1}-{endIndex} of {filteredTickets.length}
                                </div>

                                {/* Page navigation */}
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeft className="w-5 h-5 text-slate-600" />
                                    </button>

                                    {pageNumbers.map((pageNum, idx) => (
                                        pageNum === "..." ? (
                                            <span key={`ellipsis-${idx}`} className="px-3 py-2 text-slate-400">
                                                ...
                                            </span>
                                        ) : (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum as number)}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                                                    ? "bg-blue-600 text-white"
                                                    : "hover:bg-slate-100 text-slate-700"
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        )
                                    ))}

                                    <button
                                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronRight className="w-5 h-5 text-slate-600" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
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
