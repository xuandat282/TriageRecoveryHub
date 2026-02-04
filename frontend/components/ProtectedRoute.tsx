"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { Loader2 } from "lucide-react";
import type { UserRole } from "@/types/auth";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRoles?: UserRole[];
}

export default function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
    const router = useRouter();
    const { isAuthenticated, isLoading, user } = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, isLoading, router]);

    // Check role-based access
    useEffect(() => {
        if (!isLoading && isAuthenticated && requiredRoles && user) {
            const hasRequiredRole = requiredRoles.includes(user.role);

            if (!hasRequiredRole) {
                // Redirect to unauthorized page or home
                router.push("/");
            }
        }
    }, [isAuthenticated, isLoading, user, requiredRoles, router]);

    // Show loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    // Don't render if not authenticated
    if (!isAuthenticated) {
        return null;
    }

    // Don't render if role check fails
    if (requiredRoles && user && !requiredRoles.includes(user.role)) {
        return null;
    }

    return <>{children}</>;
}
