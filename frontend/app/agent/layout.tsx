"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    MessageSquare,
    BarChart3,
    Settings,
    LogOut,
    User
} from "lucide-react";

const navItems = [
    { href: "/agent", label: "Triage Queue", icon: LayoutDashboard },
    { href: "/agent/review", label: "Review Drafts", icon: MessageSquare },
    { href: "/agent/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/agent/settings", label: "Settings", icon: Settings },
];

export default function AgentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    return (
        <ProtectedRoute allowedRoles={["agent", "admin"]}>
            <div className="flex min-h-screen bg-[var(--surface-secondary)]">
                {/* Sidebar */}
                <aside className="w-64 bg-[var(--surface-primary)] border-r border-[var(--border-default)] flex flex-col">
                    {/* Logo */}
                    <div className="p-6 border-b border-[var(--border-default)]">
                        <h1 className="text-xl font-bold text-[var(--text-primary)]">
                            Triage Hub
                        </h1>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                            ? "bg-[var(--color-primary-100)] text-[var(--color-primary-700)]"
                                            : "text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)] hover:text-[var(--text-primary)]"
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile */}
                    <div className="p-4 border-t border-[var(--border-default)]">
                        <div className="flex items-center gap-3 px-4 py-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary-400)] to-[var(--color-primary-600)] flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                                    {user?.name}
                                </p>
                                <p className="text-xs text-[var(--text-tertiary)] capitalize">
                                    {user?.role}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="flex items-center gap-3 w-full px-4 py-2 mt-2 text-[var(--text-secondary)] hover:text-[var(--color-danger-600)] hover:bg-[var(--color-danger-50)] rounded-lg transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="text-sm font-medium">Sign Out</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main id="main-content" className="flex-1 p-8 overflow-auto">
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    );
}
