"use client";

import { X } from "lucide-react";
import { useTicketContext } from "./TicketProvider";
import { Badge } from "@/components/ui";
import type { BadgeVariant } from "@/components/ui/Badge";
import { TicketStatus } from "@/lib/api";

export function TicketHeader() {
    const { state, actions } = useTicketContext();
    const { ticket } = state;

    // Map status to badge variant
    const statusVariant: Record<TicketStatus, BadgeVariant> = {
        [TicketStatus.PENDING]: "pending",
        [TicketStatus.PROCESSING]: "processing",
        [TicketStatus.COMPLETED]: "completed",
        [TicketStatus.FAILED]: "failed",
    };

    // Map urgency to badge variant
    const urgencyVariant: Record<string, BadgeVariant> = {
        critical: "critical",
        high: "high",
        medium: "medium",
        low: "low",
    };

    return (
        <div className="sticky top-0 bg-[var(--surface-primary)] border-b border-[var(--border-default)] px-6 py-4 flex items-center justify-between rounded-t-xl">
            <div className="flex items-center gap-3">
                <h2
                    id="ticket-modal-title"
                    className="text-xl font-bold text-[var(--text-primary)]"
                >
                    Ticket Details
                </h2>
                <Badge variant={statusVariant[ticket.status]}>
                    {ticket.status}
                </Badge>
                {ticket.resolved && (
                    <Badge variant="resolved">Resolved</Badge>
                )}
            </div>

            <div className="flex items-center gap-3">
                {ticket.urgency && (
                    <Badge variant={urgencyVariant[ticket.urgency.toLowerCase()] || "default"}>
                        {ticket.urgency}
                    </Badge>
                )}
                <button
                    onClick={actions.close}
                    className="btn btn-ghost p-2 rounded-full"
                    aria-label="Close ticket details"
                >
                    <X className="w-5 h-5" aria-hidden="true" />
                </button>
            </div>
        </div>
    );
}
