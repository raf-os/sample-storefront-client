import { useState, useEffect } from "react";

export default function useDebounce<T = unknown>(value: T, delay: number = 300) {
    const [ debouncedValue, setDebouncedValue ] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
}