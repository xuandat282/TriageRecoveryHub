"use client";

import { cn } from "@/lib/cn";

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn("skeleton", className)}
            aria-hidden="true"
            role="presentation"
        />
    );
}

export function TicketCardSkeleton() {
    return (
        <div className="card p-4 space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Skeleton className="w-20 h-6" />
                    <Skeleton className="w-16 h-6" />
                </div>
                <Skeleton className="w-16 h-6" />
            </div>
            <Skeleton className="w-full h-12" />
            <div className="flex items-center gap-4">
                <Skeleton className="w-24 h-4" />
                <Skeleton className="w-20 h-4" />
                <Skeleton className="w-32 h-4 ml-auto" />
            </div>
        </div>
    );
}

export function TicketListSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-4" aria-label="Loading tickets…" role="status">
            {Array.from({ length: count }).map((_, i) => (
                <TicketCardSkeleton key={i} />
            ))}
        </div>
    );
}
