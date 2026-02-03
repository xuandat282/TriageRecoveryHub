"use client";

import { useEffect, useState } from "react";
import { api, type Ticket, TicketStatus } from "@/lib/api";

export default function TicketList() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTickets = async () => {
        try {
            setError(null);
            const data = await api.getTickets();
            setTickets(data.tickets);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch tickets");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();

        // Poll for updates every 5 seconds
        const interval = setInterval(fetchTickets, 5000);

        return () => clearInterval(interval);
    }, []);

    const getStatusBadge = (status: TicketStatus) => {
        const styles = {
            [TicketStatus.PENDING]: "bg-yellow-100 text-yellow-800",
            [TicketStatus.PROCESSING]: "bg-blue-100 text-blue-800",
            [TicketStatus.COMPLETED]: "bg-green-100 text-green-800",
            [TicketStatus.FAILED]: "bg-red-100 text-red-800",
        };

        return (
            <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}
            >
                {status.toUpperCase()}
            </span>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
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
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Support Tickets</h2>
                <span className="text-sm text-gray-600">
                    Total: {tickets.length}
                </span>
            </div>

            {tickets.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    No tickets yet. Submit your first ticket above!
                </div>
            ) : (
                <div className="space-y-4">
                    {tickets.map((ticket) => (
                        <div
                            key={ticket.id}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        {getStatusBadge(ticket.status)}
                                        <span className="text-xs text-gray-500">
                                            {formatDate(ticket.created_at)}
                                        </span>
                                    </div>
                                    <p className="text-gray-800 font-medium mb-2">
                                        {ticket.raw_content}
                                    </p>
                                </div>
                            </div>

                            {ticket.status === TicketStatus.COMPLETED && (
                                <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        {ticket.category && (
                                            <div>
                                                <span className="text-gray-600 font-medium">
                                                    Category:
                                                </span>{" "}
                                                <span className="text-gray-900">{ticket.category}</span>
                                            </div>
                                        )}
                                        {ticket.urgency && (
                                            <div>
                                                <span className="text-gray-600 font-medium">
                                                    Urgency:
                                                </span>{" "}
                                                <span className="text-gray-900">{ticket.urgency}</span>
                                            </div>
                                        )}
                                        {ticket.sentiment_score !== null && (
                                            <div>
                                                <span className="text-gray-600 font-medium">
                                                    Sentiment:
                                                </span>{" "}
                                                <span className="text-gray-900">
                                                    {ticket.sentiment_score}/100
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {ticket.draft_response && (
                                        <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                                            <p className="text-sm font-medium text-blue-900 mb-1">
                                                Draft Response:
                                            </p>
                                            <p className="text-sm text-blue-800">
                                                {ticket.draft_response}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {ticket.status === TicketStatus.PROCESSING && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="flex items-center gap-2 text-sm text-blue-600">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                        <span>AI is analyzing this ticket...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
