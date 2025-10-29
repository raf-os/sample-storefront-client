import { useNavigate, type ValidateNavigateOptions } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

export default function useDelayedNavigate() {
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const navigate = useNavigate();

    const navigateFn = (delayMs: number, navigateArgs: ValidateNavigateOptions) => {
        timeoutRef.current = setTimeout(() => navigate(navigateArgs), delayMs);
    }

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        }
    });

    return navigateFn;
}