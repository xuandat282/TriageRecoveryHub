"use client";

import { useTicketContext } from "./TicketProvider";

export function TicketContent() {
    const { state } = useTicketContext();
    const { ticket } = state;

    return (
        <div className="px-6 py-4 space-y-6">
            {/* Metadata Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                    <label className="text-sm font-medium text-[var(--text-secondary)] block mb-1">
                        Status
                    </label>
                    <p className="text-base font-semibold text-[var(--text-primary)] capitalize">
                        {ticket.status}
                    </p>
                </div>
                <div>
                    <label className="text-sm font-medium text-[var(--text-secondary)] block mb-1">
                        Category
                    </label>
                    <p className="text-base font-semibold text-[var(--text-primary)]">
                        {ticket.category || "N/A"}
                    </p>
                </div>
                <div>
                    <label className="text-sm font-medium text-[var(--text-secondary)] block mb-1">
                        Urgency
                    </label>
                    <p className="text-base font-semibold text-[var(--text-primary)]">
                        {ticket.urgency || "N/A"}
                    </p>
                </div>
                <div>
                    <label className="text-sm font-medium text-[var(--text-secondary)] block mb-1">
                        Sentiment
                    </label>
                    <p className="text-base font-semibold text-[var(--text-primary)]">
                        {ticket.sentiment_score !== null ? `${ticket.sentiment_score}/10` : "N/A"}
                    </p>
                </div>
            </div>

            {/* Original Request */}
            <div>
                <label className="text-sm font-medium text-[var(--text-secondary)] block mb-2">
                    Original Request
                </label>
                <div className="bg-[var(--surface-secondary)] border border-[var(--border-default)] rounded-lg p-4">
                    <p className="text-[var(--text-primary)] whitespace-pre-wrap">
                        {ticket.raw_content}
                    </p>
                </div>
            </div>

            {/* Timestamps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[var(--text-secondary)]">
                <div>
                    <span className="font-medium">Created:</span>{" "}
                    {new Date(ticket.created_at).toLocaleString()}
                </div>
                {ticket.resolved_at && (
                    <div>
                        <span className="font-medium">Resolved:</span>{" "}
                        {new Date(ticket.resolved_at).toLocaleString()}
                    </div>
                )}
            </div>
        </div>
    );
}
