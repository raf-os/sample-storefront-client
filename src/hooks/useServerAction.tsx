import { useTransition, useState } from "react";

export default function useServerAction() {
    const [ errorMessage, setErrorMessage ] = useState<string | null>(null);
    const [ isPending, startTransition ] = useTransition();
    const [ isSuccess, setIsSuccess ] = useState<boolean>(false);

    const wrappedTransition = (callback: () => Promise<unknown>) => {
        setErrorMessage(null);
        setIsSuccess(false);
        return startTransition(async () => {
            try {
                await callback();
                setIsSuccess(true);
            } catch (err) {
                if (err instanceof Error) {
                    setErrorMessage(err.message ?? "Unknown error occurred.");
                } else {
                    console.error("Unknown error caught in useServerAction hook: ", err);
                }
            }
        });
    };

    return [
        isPending,
        wrappedTransition,
        errorMessage,
        isSuccess
    ] as const;
}