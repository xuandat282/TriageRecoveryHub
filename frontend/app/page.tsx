"use client";

import { useState } from "react";
import TicketForm from "@/components/TicketForm";
import TicketList from "@/components/TicketList";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTicketCreated = () => {
    // Force refresh of ticket list
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              AI Support Triage Hub
            </h1>
            <p className="text-xl text-gray-600">
              Submit your support tickets and let AI categorize and draft responses
            </p>
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Form */}
            <div>
              <TicketForm onTicketCreated={handleTicketCreated} />
            </div>

            {/* Right Column - Ticket List */}
            <div key={refreshKey}>
              <TicketList />
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-12 text-center">
            <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                How It Works
              </h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div>
                  <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2 font-bold">
                    1
                  </div>
                  <p>Submit your support ticket with issue details</p>
                </div>
                <div>
                  <div className="bg-purple-100 text-purple-600 rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2 font-bold">
                    2
                  </div>
                  <p>AI analyzes and categorizes your ticket in the background</p>
                </div>
                <div>
                  <div className="bg-green-100 text-green-600 rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2 font-bold">
                    3
                  </div>
                  <p>Receive AI-generated draft response and categorization</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
