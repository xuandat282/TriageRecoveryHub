"use client";

import { useState } from "react";
import { api, type TicketCreateRequest } from "@/lib/api";

interface TicketFormProps {
    onTicketCreated: () => void;
}

export default function TicketForm({ onTicketCreated }: TicketFormProps) {
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!content.trim()) {
            setError("Please enter ticket content");
            return;
        }

        setIsSubmitting(true);

        try {
            const data: TicketCreateRequest = {
                raw_content: content,
            };

            await api.createTicket(data);
            setSuccess(true);
            setContent("");
            onTicketCreated();

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create ticket");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
                Submit a Support Ticket
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label
                        htmlFor="content"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Describe your issue
                    </label>
                    <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={5}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
                        placeholder="Please describe your issue in detail..."
                        disabled={isSubmitting}
                    />
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                        Ticket created successfully! AI processing has started.
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                    {isSubmitting ? "Submitting..." : "Submit Ticket"}
                </button>
            </form>
        </div>
    );
}
