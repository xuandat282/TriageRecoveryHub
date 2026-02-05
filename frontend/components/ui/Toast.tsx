"use client";

import {
    createContext,
    useContext,
    useState,
    useCallback,
    type ReactNode,
} from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

interface Toast {
    id: string;
    message: string;
    type: "success" | "error";
}

interface ToastContextValue {
    toasts: Toast[];
    showToast: (message: string, type: "success" | "error") => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: "success" | "error") => {
        const id = crypto.randomUUID();
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto dismiss after 4 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

function ToastContainer({
    toasts,
    removeToast,
}: {
    toasts: Toast[];
    removeToast: (id: string) => void;
}) {
    if (toasts.length === 0) return null;

    return (
        <div
            className="toast-container"
            role="region"
            aria-label="Notifications"
            aria-live="polite"
        >
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`toast ${toast.type === "success" ? "toast-success" : "toast-error"}`}
                    role="alert"
                >
                    <div className="flex items-center gap-3">
                        {toast.type === "success" ? (
                            <CheckCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                        ) : (
                            <XCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                        )}
                        <span className="flex-1 text-sm font-medium">{toast.message}</span>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="p-1 rounded-full hover:bg-black/10 transition-colors"
                            aria-label="Dismiss notification"
                        >
                            <X className="w-4 h-4" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
