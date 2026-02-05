"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

type Theme = "light" | "dark" | "system";

export default function ThemeToggle() {
    const [theme, setTheme] = useState<Theme>("system");
    const [mounted, setMounted] = useState(false);

    // Only run on client to avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem("theme") as Theme | null;
        if (stored) {
            setTheme(stored);
        }
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const root = document.documentElement;

        if (theme === "system") {
            root.removeAttribute("data-theme");
            localStorage.removeItem("theme");
        } else {
            root.setAttribute("data-theme", theme);
            localStorage.setItem("theme", theme);
        }
    }, [theme, mounted]);

    const toggleTheme = () => {
        setTheme((prev) => {
            if (prev === "light") return "dark";
            if (prev === "dark") return "system";
            return "light";
        });
    };

    // Avoid hydration mismatch - render nothing on server
    if (!mounted) {
        return (
            <button
                className="btn btn-ghost p-2"
                aria-label="Toggle theme"
                disabled
            >
                <div className="w-5 h-5" />
            </button>
        );
    }

    const isDark =
        theme === "dark" ||
        (theme === "system" &&
            window.matchMedia("(prefers-color-scheme: dark)").matches);

    return (
        <button
            onClick={toggleTheme}
            className="btn btn-ghost p-2"
            aria-label={`Current theme: ${theme}. Click to toggle.`}
            title={`Theme: ${theme}`}
        >
            {isDark ? (
                <Moon className="w-5 h-5" aria-hidden="true" />
            ) : (
                <Sun className="w-5 h-5" aria-hidden="true" />
            )}
        </button>
    );
}
