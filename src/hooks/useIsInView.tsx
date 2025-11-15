import { useEffect, useRef } from "react";

export default function useInView<T extends HTMLElement = HTMLElement>(
    callback: () => void,
    options?: IntersectionObserverInit
) {
    const ref = useRef<T>(null);

    useEffect(() => {
        if (!ref.current) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                callback();
                observer.disconnect();
            }
        }, options);

        observer.observe(ref.current);

        return () => observer.disconnect();
    });

    return ref;
}