"use client";

import { type Ticket, TicketStatus } from "@/lib/api";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui";
import type { BadgeVariant } from "@/components/ui/Badge";
import { Clock, CheckCircle2, XCircle } from "lucide-react";

interface TicketCardProps {
    ticket: Ticket;
    onClick: () => void;
}

export default function TicketCard({ ticket, onClick }: TicketCardProps) {
    // Map urgency to badge variant
    const urgencyVariant: Record<string, BadgeVariant> = {
        critical: "critical",
        high: "high",
        medium: "medium",
        low: "low",
    };

    // Map status to badge variant
    const statusVariant: Record<TicketStatus, BadgeVariant> = {
        [TicketStatus.PENDING]: "pending",
        [TicketStatus.PROCESSING]: "processing",
        [TicketStatus.COMPLETED]: "completed",
        [TicketStatus.FAILED]: "failed",
    };

    const getStatusIcon = (status: TicketStatus) => {
        switch (status) {
            case TicketStatus.PENDING:
                return <Clock className="w-4 h-4" aria-hidden="true" />;
            case TicketStatus.PROCESSING:
                return <div className="spinner" aria-hidden="true" />;
            case TicketStatus.COMPLETED:
                return <CheckCircle2 className="w-4 h-4 text-[var(--color-success-600)]" aria-hidden="true" />;
            case TicketStatus.FAILED:
                return <XCircle className="w-4 h-4 text-[var(--color-danger-600)]" aria-hidden="true" />;
        }
    };

    return (
        <div
            onClick={onClick}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onClick();
                }
            }}
            role="button"
            tabIndex={0}
            className={cn(
                "card card-interactive p-4",
                ticket.resolved && "opacity-60"
            )}
            aria-label={`Ticket: ${ticket.raw_content.slice(0, 50)}${ticket.raw_content.length > 50 ? "…" : ""}. Status: ${ticket.status}${ticket.urgency ? `. Urgency: ${ticket.urgency}` : ""}`}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    {getStatusIcon(ticket.status)}
                    <Badge variant={statusVariant[ticket.status]}>
                        {ticket.status}
                    </Badge>
                    {ticket.resolved && (
                        <Badge variant="resolved">Resolved</Badge>
                    )}
                </div>
                {ticket.urgency && (
                    <Badge variant={urgencyVariant[ticket.urgency.toLowerCase()] || "default"}>
                        {ticket.urgency}
                    </Badge>
                )}
            </div>

            {/* Content */}
            <p className="text-[var(--text-primary)] font-medium mb-2 line-clamp-2">
                {ticket.raw_content}
            </p>

            {/* Metadata */}
            <div className="flex items-center gap-4 text-xs text-[var(--text-tertiary)]">
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
                <span className="ml-auto font-variant-numeric tabular-nums">
                    {new Date(ticket.created_at).toLocaleString()}
                </span>
            </div>
        </div>
    );
}
