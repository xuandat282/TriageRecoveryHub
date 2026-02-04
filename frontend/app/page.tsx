"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header";
import TicketForm from "@/components/TicketForm";
import TicketList from "@/components/TicketList";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTicketCreated = () => {
    // Force refresh of ticket list
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Header />

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Page Title */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Support Dashboard
              </h1>
              <p className="text-slate-600">
                Manage and track support tickets with AI-powered assistance
              </p>
            </div>

            {/* Main Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Left Column - Form */}
              <div>
                <TicketForm onTicketCreated={handleTicketCreated} />
              </div>

              {/* Right Column - Ticket List */}
              <div key={refreshKey}>
                <TicketList />
              </div>
            </div>

            {/* Info Cards */}
            <div className="mt-8 grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-lg">1</span>
                  </div>
                  <h3 className="font-semibold text-slate-900">Submit Ticket</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Describe your issue in detail for accurate AI analysis
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <span className="text-indigo-600 font-bold text-lg">2</span>
                  </div>
                  <h3 className="font-semibold text-slate-900">AI Analysis</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Automatic categorization, urgency assessment, and sentiment analysis
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 font-bold text-lg">3</span>
                  </div>
                  <h3 className="font-semibold text-slate-900">Get Response</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Receive AI-generated draft responses and track resolution
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
