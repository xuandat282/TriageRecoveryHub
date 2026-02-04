"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/authSlice";
import { Shield, LogOut, User, ChevronDown } from "lucide-react";
import { UserRole } from "@/types/auth";
import { useState, useRef, useEffect } from "react";

export default function Header() {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        dispatch(logout());
    };

    const getRoleBadge = (role: UserRole) => {
        const badges = {
            [UserRole.CUSTOMER]: {
                bg: "bg-blue-100",
                text: "text-blue-700",
                label: "Customer",
            },
            [UserRole.AGENT]: {
                bg: "bg-purple-100",
                text: "text-purple-700",
                label: "Agent",
            },
            [UserRole.ADMIN]: {
                bg: "bg-red-100",
                text: "text-red-700",
                label: "Admin",
            },
        };

        const badge = badges[role];
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
                {badge.label}
            </span>
        );
    };

    return (
        <header className="bg-white border-b border-slate-200 shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo and Brand */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900">
                                Triage Recovery Hub
                            </h1>
                            <p className="text-xs text-slate-500">
                                Enterprise Support Platform
                            </p>
                        </div>
                    </div>

                    {/* User Menu */}
                    {user && (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                                        <User className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="text-left hidden sm:block">
                                        <p className="text-sm font-semibold text-slate-900">
                                            {user.full_name}
                                        </p>
                                        <p className="text-xs text-slate-500">{user.email}</p>
                                    </div>
                                </div>
                                <ChevronDown
                                    className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""
                                        }`}
                                />
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                                    <div className="px-4 py-3 border-b border-slate-200">
                                        <p className="text-sm font-semibold text-slate-900 mb-1">
                                            {user.full_name}
                                        </p>
                                        <p className="text-xs text-slate-500 mb-2">{user.email}</p>
                                        {getRoleBadge(user.role)}
                                    </div>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full px-4 py-2.5 text-left flex items-center gap-2 hover:bg-red-50 text-red-600 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span className="text-sm font-medium">Sign Out</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
