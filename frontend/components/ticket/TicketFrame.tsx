"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useTicketContext } from "./TicketProvider";

interface TicketFrameProps {
    children: ReactNode;
}

export function TicketFrame({ children }: TicketFrameProps) {
    const { actions } = useTicketContext();
    const modalRef = useRef<HTMLDivElement>(null);
    const previousFocus = useRef<HTMLElement | null>(null);

    // Focus trap and keyboard handling
    useEffect(() => {
        // Store current focus
        previousFocus.current = document.activeElement as HTMLElement;

        // Focus the modal
        modalRef.current?.focus();

        // Handle escape key
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                actions.close();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        // Prevent body scroll
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
            // Restore focus
            previousFocus.current?.focus();
        };
    }, [actions]);

    // Click outside to close
    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            actions.close();
        }
    };

    return (
        <div
            className="modal-overlay"
            onClick={handleOverlayClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ticket-modal-title"
        >
            <div
                ref={modalRef}
                className="modal-content card glass"
                tabIndex={-1}
            >
                {children}
            </div>
        </div>
    );
}
