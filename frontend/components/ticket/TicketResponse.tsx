"use client";

import { useTicketContext } from "./TicketProvider";
import { Button } from "@/components/ui";
import { Save } from "lucide-react";

export function TicketResponse() {
    const { state, actions, meta } = useTicketContext();
    const { ticket, isEditing, draftResponse } = state;

    const canEdit = ticket.status === "completed" && !ticket.resolved;

    return (
        <div className="px-6 py-4 border-t border-[var(--border-default)]">
            <div className="flex items-center justify-between mb-3">
                <label
                    htmlFor="draft-response"
                    className="text-sm font-medium text-[var(--text-secondary)]"
                >
                    Draft Response
                </label>
                {!isEditing && canEdit && (
                    <button
                        onClick={() => actions.setEditing(true)}
                        className="text-sm text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] font-medium transition-colors"
                    >
                        Edit
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="space-y-3">
                    <textarea
                        id="draft-response"
                        ref={meta.draftInputRef}
                        value={draftResponse}
                        onChange={(e) => actions.updateDraft(e.target.value)}
                        rows={8}
                        className="input resize-none"
                        placeholder="Edit the draft response…"
                        aria-describedby="draft-response-help"
                    />
                    <p id="draft-response-help" className="sr-only">
                        Edit the AI-generated draft response before sending to the customer.
                    </p>
                    <div className="flex gap-3">
                        <Button
                            variant="primary"
                            onClick={actions.saveDraft}
                            isLoading={meta.isSaving}
                            leftIcon={<Save className="w-4 h-4" />}
                        >
                            Save Changes
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                actions.updateDraft(ticket.draft_response || "");
                                actions.setEditing(false);
                            }}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)] border border-[var(--color-primary-200)] dark:border-[var(--color-primary-700)] rounded-lg p-4">
                    <p className="text-[var(--text-primary)] whitespace-pre-wrap">
                        {ticket.draft_response || "No draft response available yet."}
                    </p>
                </div>
            )}
        </div>
    );
}
