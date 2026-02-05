/**
 * Utility functions for formatting and data manipulation
 */

/**
 * Truncate text to a maximum length with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
}

/**
 * Format date to relative time (e.g., "2 hours ago", "3 days ago")
 */
export function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return "just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

    // For older dates, show the actual date
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
}

/**
 * Format date to full datetime string
 */
export function formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

/**
 * Generate array of page numbers for pagination
 */
export function generatePageNumbers(
    currentPage: number,
    totalPages: number,
    maxVisible: number = 5
): (number | "...")[] {
    if (totalPages <= maxVisible) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "...")[] = [];
    const halfVisible = Math.floor(maxVisible / 2);

    if (currentPage <= halfVisible + 1) {
        // Near the start
        for (let i = 1; i <= maxVisible - 1; i++) {
            pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
    } else if (currentPage >= totalPages - halfVisible) {
        // Near the end
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - (maxVisible - 2); i <= totalPages; i++) {
            pages.push(i);
        }
    } else {
        // In the middle
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
    }

    return pages;
}
