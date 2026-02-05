"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import TicketForm from "@/components/TicketForm";
import TicketList from "@/components/TicketList";
import { Sparkles, Zap, CheckCircle, LogIn } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect authenticated users to their dashboard
    if (!isLoading && isAuthenticated && user) {
      if (user.role === "customer") {
        router.push("/customer");
      } else {
        router.push("/agent");
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  const handleTicketCreated = () => {
    // Force refresh of ticket list
    setRefreshKey((prev) => prev + 1);
  };

  // Show loading while checking auth
  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[var(--surface-secondary)]">
        <div className="spinner w-8 h-8 border-[var(--color-primary-500)]" />
      </main>
    );
  }

  // If authenticated, show loading while redirecting
  if (isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[var(--surface-secondary)]">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4 border-[var(--color-primary-500)]" />
          <p className="text-[var(--text-secondary)]">Redirecting to dashboard...</p>
        </div>
      </main>
    );
  }

  // Show landing page for unauthenticated users
  return (
    <main id="main-content" className="min-h-screen bg-[var(--surface-secondary)]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-100)] via-[var(--surface-secondary)] to-[var(--color-primary-50)] opacity-60" />

        {/* Decorative Blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-[var(--color-primary-300)] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-[var(--color-primary-400)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "1s" }} />

        <div className="container relative mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-6xl font-bold text-[var(--text-primary)] mb-6 leading-tight">
                AI Support{" "}
                <span className="bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-700)] bg-clip-text text-transparent">
                  Triage Hub
                </span>
              </h1>
              <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-8">
                AI-powered support ticket management for modern teams
              </p>
              <Link href="/login" className="btn btn-primary py-3 px-8 text-lg">
                <LogIn className="w-5 h-5" />
                Sign In to Get Started
              </Link>
            </div>

            {/* How it Works Section */}
            <div className="card glass p-8 max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] text-center mb-8">
                How It Works
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-[var(--color-primary-400)] to-[var(--color-primary-600)] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Sparkles className="w-7 h-7 text-white" aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold text-[var(--text-primary)] mb-2">
                    1. Submit Ticket
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Describe your issue in detail for accurate categorization
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-[var(--color-primary-400)] to-[var(--color-primary-600)] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Zap className="w-7 h-7 text-white" aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold text-[var(--text-primary)] mb-2">
                    2. AI Analysis
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Our AI analyzes, categorizes, and drafts a response
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-[var(--color-success-400)] to-[var(--color-success-600)] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <CheckCircle className="w-7 h-7 text-white" aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold text-[var(--text-primary)] mb-2">
                    3. Get Response
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Review AI drafts and resolve tickets efficiently
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
