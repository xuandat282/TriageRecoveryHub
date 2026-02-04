import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useTicketEvents() {
    const queryClient = useQueryClient();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    useEffect(() => {
        const eventSource = new EventSource(`${apiUrl}/events`);

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.type === "ticket_update") {
                    console.log("Received ticket update:", data);
                    // Invalidate tickets query to trigger refetch
                    queryClient.invalidateQueries({ queryKey: ["tickets"] });
                }
            } catch (error) {
                console.error("Failed to parse SSE message:", error);
            }
        };

        eventSource.onerror = (error) => {
            console.error("EventSource failed:", error);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, [queryClient, apiUrl]);
}
