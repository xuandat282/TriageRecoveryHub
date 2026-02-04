"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { Provider as ReduxProvider } from "react-redux";
import { queryClient } from "@/lib/queryClient";
import { store } from "@/store/store";
import { AuthInitializer } from "@/components/AuthInitializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReduxProvider store={store}>
          <QueryClientProvider client={queryClient}>
            <AuthInitializer />
            {children}
          </QueryClientProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
