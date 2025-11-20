import { useTransition, useState } from "react";

export default function useServerAction() {
    const [ errorMessage, setErrorMessage ] = useState<string | null>(null);
    const [ isPending, startTransition ] = useTransition();

    const wrappedTransition = (callback: () => Promise<void>) => {
        setErrorMessage(null);
        return startTransition(async () => {
            try {
                await callback();
            } catch (err) {
                if (err instanceof Error) {
                    setErrorMessage(err.message ?? "Unknown error occurred.");
                } else {
                    console.error("Unknown error caught in useServerAction hook: ", err);
                }
            }
        });
    };

    const clearError = () => setErrorMessage(null);

    return [
        isPending,
        wrappedTransition,
        errorMessage,
    ] as const;
}