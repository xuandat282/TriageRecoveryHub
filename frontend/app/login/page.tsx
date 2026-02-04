"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loginUser, clearError } from "@/store/authSlice";
import { Shield, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import type { LoginCredentials } from "@/types/auth";

export default function LoginPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginCredentials>();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.push("/");
        }
    }, [isAuthenticated, router]);

    // Clear error on mount
    useEffect(() => {
        dispatch(clearError());
    }, [dispatch]);

    const onSubmit = async (data: LoginCredentials) => {
        const result = await dispatch(loginUser(data));

        if (loginUser.fulfilled.match(result)) {
            router.push("/");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo and Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        Triage Recovery Hub
                    </h1>
                    <p className="text-slate-600">
                        Enterprise Support Management Platform
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-semibold text-slate-900 mb-1">
                            Sign In
                        </h2>
                        <p className="text-sm text-slate-600">
                            Access your support dashboard
                        </p>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-red-900">
                                    Authentication Failed
                                </p>
                                <p className="text-sm text-red-700 mt-1">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Email Field */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-slate-700 mb-2"
                            >
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    {...register("email", {
                                        required: "Email is required",
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Invalid email address",
                                        },
                                    })}
                                    className={`
                    block w-full pl-10 pr-3 py-2.5 
                    border rounded-lg
                    text-slate-900 placeholder-slate-400
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-colors
                    ${errors.email ? "border-red-300 bg-red-50" : "border-slate-300 bg-white"}
                  `}
                                    placeholder="you@company.com"
                                    disabled={isLoading}
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1.5 text-sm text-red-600">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-slate-700 mb-2"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    {...register("password", {
                                        required: "Password is required",
                                        minLength: {
                                            value: 8,
                                            message: "Password must be at least 8 characters",
                                        },
                                    })}
                                    className={`
                    block w-full pl-10 pr-3 py-2.5 
                    border rounded-lg
                    text-slate-900 placeholder-slate-400
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-colors
                    ${errors.password ? "border-red-300 bg-red-50" : "border-slate-300 bg-white"}
                  `}
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                />
                            </div>
                            {errors.password && (
                                <p className="mt-1.5 text-sm text-red-600">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="
                w-full py-3 px-4
                bg-gradient-to-r from-blue-600 to-indigo-600
                hover:from-blue-700 hover:to-indigo-700
                text-white font-semibold rounded-lg
                shadow-lg shadow-blue-500/30
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
                flex items-center justify-center gap-2
              "
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Signing In...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 pt-6 border-t border-slate-200">
                        <p className="text-center text-sm text-slate-600">
                            Secure authentication powered by JWT
                        </p>
                    </div>
                </div>

                {/* Demo Credentials */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs font-medium text-blue-900 mb-2">
                        Demo Credentials
                    </p>
                    <div className="space-y-1 text-xs text-blue-700">
                        <p>
                            <span className="font-medium">Customer:</span> customer@demo.com / password123
                        </p>
                        <p>
                            <span className="font-medium">Agent:</span> agent@demo.com / password123
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
