"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type Ticket, api } from "@/lib/api";
import { X, Save, CheckCircle } from "lucide-react";

interface TicketDetailProps {
    ticket: Ticket;
    onClose: () => void;
}

export default function TicketDetail({ ticket, onClose }: TicketDetailProps) {
    const [draftResponse, setDraftResponse] = useState(ticket.draft_response || "");
    const [isEditing, setIsEditing] = useState(false);
    const queryClient = useQueryClient();

    const updateMutation = useMutation({
        mutationFn: (data: { draft_response: string }) =>
            api.updateTicket(ticket.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tickets"] });
            setIsEditing(false);
        },
    });

    const resolveMutation = useMutation({
        mutationFn: () => api.resolveTicket(ticket.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tickets"] });
            onClose();
        },
    });

    const handleSave = () => {
        updateMutation.mutate({ draft_response: draftResponse });
    };

    const handleResolve = () => {
        if (confirm("Are you sure you want to resolve this ticket?")) {
            resolveMutation.mutate();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Ticket Details</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Status and Metadata */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600">Status</label>
                            <p className="text-lg font-semibold text-gray-900 capitalize">
                                {ticket.status}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Category</label>
                            <p className="text-lg font-semibold text-gray-900">
                                {ticket.category || "N/A"}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Urgency</label>
                            <p className="text-lg font-semibold text-gray-900">
                                {ticket.urgency || "N/A"}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Sentiment</label>
                            <p className="text-lg font-semibold text-gray-900">
                                {ticket.sentiment_score !== null ? `${ticket.sentiment_score}/10` : "N/A"}
                            </p>
                        </div>
                    </div>

                    {/* Original Content */}
                    <div>
                        <label className="text-sm font-medium text-gray-600 block mb-2">
                            Original Request
                        </label>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className="text-gray-900 whitespace-pre-wrap">{ticket.raw_content}</p>
                        </div>
                    </div>

                    {/* Draft Response */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-gray-600">
                                Draft Response
                            </label>
                            {!isEditing && ticket.status === "completed" && !ticket.resolved && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Edit
                                </button>
                            )}
                        </div>
                        {isEditing ? (
                            <div className="space-y-2">
                                <textarea
                                    value={draftResponse}
                                    onChange={(e) => setDraftResponse(e.target.value)}
                                    rows={8}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
                                    placeholder="Edit the draft response..."
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSave}
                                        disabled={updateMutation.isPending}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors"
                                    >
                                        <Save className="w-4 h-4" />
                                        {updateMutation.isPending ? "Saving..." : "Save Changes"}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setDraftResponse(ticket.draft_response || "");
                                            setIsEditing(false);
                                        }}
                                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                                <p className="text-gray-900 dark:text-gray-50 whitespace-pre-wrap">
                                    {ticket.draft_response || "No draft response available yet."}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Timestamps */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
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

                {/* Footer Actions */}
                {!ticket.resolved && ticket.status === "completed" && (
                    <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4">
                        <button
                            onClick={handleResolve}
                            disabled={resolveMutation.isPending}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold rounded-lg transition-colors"
                        >
                            <CheckCircle className="w-5 h-5" />
                            {resolveMutation.isPending ? "Resolving..." : "Mark as Resolved"}
                        </button>
                    </div>
                )}

                {ticket.resolved && (
                    <div className="sticky bottom-0 bg-green-50 border-t border-green-200 px-6 py-4">
                        <div className="flex items-center gap-2 text-green-800">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-semibold">This ticket has been resolved</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
