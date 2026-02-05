"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { api, type TicketCreateRequest } from "@/lib/api";
import { Button } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { Send } from "lucide-react";

// Dynamic import for Quill (client-side only)
const RichTextEditor = dynamic(
    () => import("@/components/ui/RichTextEditor"),
    {
        ssr: false,
        loading: () => (
            <div className="h-[200px] bg-[var(--surface-secondary)] rounded-lg animate-pulse" />
        )
    }
);

interface TicketFormProps {
    onTicketCreated: () => void;
}

export default function TicketForm({ onTicketCreated }: TicketFormProps) {
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const errorRef = useRef<HTMLDivElement>(null);
    const { showToast } = useToast();

    // Focus error message when it appears
    useEffect(() => {
        if (error && errorRef.current) {
            errorRef.current.focus();
        }
    }, [error]);

    // Strip HTML tags to get plain text for validation
    const getPlainText = (html: string) => {
        const temp = document.createElement("div");
        temp.innerHTML = html;
        return temp.textContent || temp.innerText || "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const plainText = getPlainText(content).trim();
        if (!plainText) {
            setError("Please enter ticket content");
            return;
        }

        setIsSubmitting(true);

        try {
            const data: TicketCreateRequest = {
                raw_content: content, // Keep HTML for rich formatting
            };

            await api.createTicket(data);
            setContent("");
            onTicketCreated();
            showToast("Ticket created! AI processing has started…", "success");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to create ticket";
            setError(message);
            showToast(message, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="card p-6">
            <h2 className="text-2xl font-bold mb-4 text-[var(--text-primary)]">
                Submit a Support Ticket
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                    <label
                        htmlFor="ticket-content"
                        className="block text-sm font-medium text-[var(--text-secondary)] mb-2"
                    >
                        Describe your issue
                    </label>
                    <RichTextEditor
                        value={content}
                        onChange={setContent}
                        placeholder="Please describe your issue in detail…"
                        minHeight="150px"
                    />
                    <p id="ticket-help" className="text-xs text-[var(--text-tertiary)] mt-1">
                        Use formatting to highlight important details. Provide as much context as possible.
                    </p>
                </div>

                {error && (
                    <div
                        id="ticket-error"
                        ref={errorRef}
                        className="bg-[var(--color-danger-50)] border border-[var(--color-danger-500)] text-[var(--color-danger-700)] px-4 py-3 rounded-lg"
                        role="alert"
                        tabIndex={-1}
                    >
                        {error}
                    </div>
                )}

                <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                    leftIcon={<Send className="w-4 h-4" />}
                    className="w-full"
                    size="lg"
                >
                    Submit Ticket
                </Button>
            </form>
        </div>
    );
}

