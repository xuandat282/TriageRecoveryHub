"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type BadgeVariant =
    | "pending"
    | "processing"
    | "completed"
    | "failed"
    | "resolved"
    | "critical"
    | "high"
    | "medium"
    | "low"
    | "default";

interface BadgeProps {
    variant?: BadgeVariant;
    children: ReactNode;
    className?: string;
    icon?: ReactNode;
}

export default function Badge({
    variant = "default",
    children,
    className,
    icon,
}: BadgeProps) {
    const variantClasses: Record<BadgeVariant, string> = {
        pending: "badge-pending",
        processing: "badge-processing",
        completed: "badge-completed",
        failed: "badge-failed",
        resolved: "badge-resolved",
        critical: "badge-critical",
        high: "badge-high",
        medium: "badge-medium",
        low: "badge-low",
        default: "bg-gray-100 text-gray-700",
    };

    return (
        <span className={cn("badge", variantClasses[variant], className)}>
            {icon && <span aria-hidden="true">{icon}</span>}
            {children}
        </span>
    );
}
