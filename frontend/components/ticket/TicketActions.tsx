"use client";

import { CheckCircle } from "lucide-react";
import { useTicketContext } from "./TicketProvider";
import { Button } from "@/components/ui";

export function TicketActions() {
    const { state, actions, meta } = useTicketContext();
    const { ticket } = state;

    // If resolved, show resolved state
    if (ticket.resolved) {
        return (
            <div className="sticky bottom-0 bg-[var(--color-success-50)] border-t border-[var(--color-success-500)] px-6 py-4 rounded-b-xl">
                <div className="flex items-center gap-2 text-[var(--color-success-700)]">
                    <CheckCircle className="w-5 h-5" aria-hidden="true" />
                    <span className="font-semibold">This ticket has been resolved</span>
                </div>
            </div>
        );
    }

    // If not completed, don't show actions
    if (ticket.status !== "completed") {
        return null;
    }

    return (
        <div className="sticky bottom-0 bg-[var(--surface-secondary)] border-t border-[var(--border-default)] px-6 py-4 rounded-b-xl">
            <Button
                variant="success"
                onClick={actions.resolve}
                isLoading={meta.isResolving}
                leftIcon={<CheckCircle className="w-5 h-5" />}
                className="w-full"
                size="lg"
            >
                Mark as Resolved
            </Button>
        </div>
    );
}
