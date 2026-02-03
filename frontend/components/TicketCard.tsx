"use client";

import { type Ticket, TicketStatus } from "@/lib/api";
import { cn } from "@/lib/cn";
import { Clock, CheckCircle2, AlertCircle, XCircle } from "lucide-react";

interface TicketCardProps {
    ticket: Ticket;
    onClick: () => void;
}

export default function TicketCard({ ticket, onClick }: TicketCardProps) {
    const getUrgencyStyles = (urgency: string | null) => {
        switch (urgency?.toLowerCase()) {
            case "critical":
                return "bg-red-100 text-red-800 border-red-300";
            case "high":
                return "bg-orange-100 text-orange-800 border-orange-300";
            case "medium":
                return "bg-yellow-100 text-yellow-800 border-yellow-300";
            case "low":
                return "bg-green-100 text-green-800 border-green-300";
            default:
                return "bg-gray-100 text-gray-800 border-gray-300";
        }
    };

    const getStatusIcon = (status: TicketStatus) => {
        switch (status) {
            case TicketStatus.PENDING:
                return <Clock className="w-4 h-4" />;
            case TicketStatus.PROCESSING:
                return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>;
            case TicketStatus.COMPLETED:
                return <CheckCircle2 className="w-4 h-4 text-green-600" />;
            case TicketStatus.FAILED:
                return <XCircle className="w-4 h-4 text-red-600" />;
        }
    };

    const getStatusStyles = (status: TicketStatus) => {
        switch (status) {
            case TicketStatus.PENDING:
                return "bg-yellow-100 text-yellow-800";
            case TicketStatus.PROCESSING:
                return "bg-blue-100 text-blue-800";
            case TicketStatus.COMPLETED:
                return "bg-green-100 text-green-800";
            case TicketStatus.FAILED:
                return "bg-red-100 text-red-800";
        }
    };

    return (
        <div
            onClick={onClick}
            className={cn(
                "border rounded-lg p-4 cursor-pointer transition-all duration-200",
                "hover:shadow-lg hover:border-blue-400",
                ticket.resolved && "opacity-60 bg-gray-50"
            )}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    {getStatusIcon(ticket.status)}
                    <span className={cn("px-2 py-1 rounded-full text-xs font-semibold", getStatusStyles(ticket.status))}>
                        {ticket.status.toUpperCase()}
                    </span>
                    {ticket.resolved && (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-700">
                            RESOLVED
                        </span>
                    )}
                </div>
                {ticket.urgency && (
                    <span className={cn("px-3 py-1 rounded-full text-xs font-semibold border", getUrgencyStyles(ticket.urgency))}>
                        {ticket.urgency.toUpperCase()}
                    </span>
                )}
            </div>

            {/* Content */}
            <p className="text-gray-800 font-medium mb-2 line-clamp-2">
                {ticket.raw_content}
            </p>

            {/* Metadata */}
            <div className="flex items-center gap-4 text-xs text-gray-500">
                {ticket.category && (
                    <span className="flex items-center gap-1">
                        <span className="font-medium">Category:</span> {ticket.category}
                    </span>
                )}
                {ticket.sentiment_score !== null && (
                    <span className="flex items-center gap-1">
                        <span className="font-medium">Sentiment:</span> {ticket.sentiment_score}/10
                    </span>
                )}
                <span className="ml-auto">
                    {new Date(ticket.created_at).toLocaleString()}
                </span>
            </div>
        </div>
    );
}
