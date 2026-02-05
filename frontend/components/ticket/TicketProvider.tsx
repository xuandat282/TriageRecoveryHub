"use client";

import {
    createContext,
    useContext,
    useState,
    useCallback,
    useRef,
    type ReactNode,
} from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type Ticket as TicketType } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

// Context Interface following composition patterns
interface TicketState {
    ticket: TicketType;
    isEditing: boolean;
    draftResponse: string;
}

interface TicketActions {
    setEditing: (editing: boolean) => void;
    updateDraft: (draft: string) => void;
    saveDraft: () => Promise<void>;
    resolve: () => Promise<void>;
    close: () => void;
}

interface TicketMeta {
    isSaving: boolean;
    isResolving: boolean;
    draftInputRef: React.RefObject<HTMLTextAreaElement | null>;
}

interface TicketContextValue {
    state: TicketState;
    actions: TicketActions;
    meta: TicketMeta;
}

const TicketContext = createContext<TicketContextValue | null>(null);

// Hook to use ticket context
export function useTicketContext() {
    const context = useContext(TicketContext);
    if (!context) {
        throw new Error("useTicketContext must be used within a TicketProvider");
    }
    return context;
}

// Provider Props
interface TicketProviderProps {
    ticket: TicketType;
    onClose: () => void;
    children: ReactNode;
}

// Ticket Provider - implements the context interface
export function TicketProvider({ ticket, onClose, children }: TicketProviderProps) {
    const [isEditing, setEditing] = useState(false);
    const [draftResponse, setDraftResponse] = useState(ticket.draft_response || "");
    const draftInputRef = useRef<HTMLTextAreaElement>(null);
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    const updateMutation = useMutation({
        mutationFn: (data: { draft_response: string }) =>
            api.updateTicket(ticket.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tickets"] });
            setEditing(false);
            showToast("Draft response saved successfully", "success");
        },
        onError: () => {
            showToast("Failed to save draft response", "error");
        },
    });

    const resolveMutation = useMutation({
        mutationFn: () => api.resolveTicket(ticket.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tickets"] });
            showToast("Ticket resolved successfully", "success");
            onClose();
        },
        onError: () => {
            showToast("Failed to resolve ticket", "error");
        },
    });

    const saveDraft = useCallback(async () => {
        await updateMutation.mutateAsync({ draft_response: draftResponse });
    }, [updateMutation, draftResponse]);

    const resolve = useCallback(async () => {
        if (confirm("Are you sure you want to resolve this ticket?")) {
            await resolveMutation.mutateAsync();
        }
    }, [resolveMutation]);

    const updateDraft = useCallback((draft: string) => {
        setDraftResponse(draft);
    }, []);

    const state: TicketState = {
        ticket,
        isEditing,
        draftResponse,
    };

    const actions: TicketActions = {
        setEditing,
        updateDraft,
        saveDraft,
        resolve,
        close: onClose,
    };

    const meta: TicketMeta = {
        isSaving: updateMutation.isPending,
        isResolving: resolveMutation.isPending,
        draftInputRef,
    };

    return (
        <TicketContext.Provider value={{ state, actions, meta }}>
            {children}
        </TicketContext.Provider>
    );
}
