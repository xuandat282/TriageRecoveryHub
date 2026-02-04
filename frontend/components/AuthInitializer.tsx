"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { loadUserFromToken } from "@/store/authSlice";

/**
 * AuthInitializer component
 * Loads user from stored token on app mount
 */
export function AuthInitializer() {
    const dispatch = useAppDispatch();

    useEffect(() => {
        // Try to load user from stored token
        dispatch(loadUserFromToken());
    }, [dispatch]);

    return null;
}
