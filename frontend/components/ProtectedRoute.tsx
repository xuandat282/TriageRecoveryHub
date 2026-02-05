"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: ('customer' | 'agent' | 'admin')[];
    redirectTo?: string;
}

export default function ProtectedRoute({
    children,
    allowedRoles,
    redirectTo = "/login"
}: ProtectedRouteProps) {
    const { user, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        // If not authenticated, redirect to login
        if (!isAuthenticated) {
            router.push(redirectTo);
            return;
        }

        // If role restriction exists, check if user has allowed role
        if (allowedRoles && user && !allowedRoles.includes(user.role)) {
            // Redirect based on user's actual role
            if (user.role === 'customer') {
                router.push('/customer');
            } else {
                router.push('/agent');
            }
        }
    }, [isLoading, isAuthenticated, user, allowedRoles, router, redirectTo]);

    // Show loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--surface-secondary)]">
                <div className="text-center">
                    <div className="spinner w-8 h-8 mx-auto mb-4 border-[var(--color-primary-500)]" />
                    <p className="text-[var(--text-secondary)]">Loading...</p>
                </div>
            </div>
        );
    }

    // If not authenticated or wrong role, show nothing (redirect will happen)
    if (!isAuthenticated) return null;
    if (allowedRoles && user && !allowedRoles.includes(user.role)) return null;

    return <>{children}</>;
}
