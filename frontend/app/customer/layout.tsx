"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Ticket,
    HelpCircle,
    LogOut,
    User
} from "lucide-react";

const navItems = [
    { href: "/customer", label: "My Tickets", icon: Ticket },
    { href: "/customer/help", label: "Help Center", icon: HelpCircle },
];

export default function CustomerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    return (
        <ProtectedRoute allowedRoles={["customer"]}>
            <div className="min-h-screen bg-[var(--surface-secondary)]">
                {/* Header */}
                <header className="bg-[var(--surface-primary)] border-b border-[var(--border-default)] sticky top-0 z-40">
                    <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            <h1 className="text-xl font-bold text-[var(--text-primary)]">
                                Support Hub
                            </h1>
                            <nav className="flex items-center gap-4">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isActive
                                                    ? "bg-[var(--color-primary-100)] text-[var(--color-primary-700)]"
                                                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)] hover:text-[var(--text-primary)]"
                                                }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            <span className="font-medium">{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* User Menu */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary-400)] to-[var(--color-primary-600)] flex items-center justify-center">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-sm font-medium text-[var(--text-primary)]">
                                    {user?.name}
                                </span>
                            </div>
                            <button
                                onClick={logout}
                                className="p-2 text-[var(--text-tertiary)] hover:text-[var(--color-danger-600)] transition-colors"
                                title="Sign Out"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main id="main-content" className="container mx-auto px-4 py-8">
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    );
}
