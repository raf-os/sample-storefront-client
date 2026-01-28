import { useTransition, useState } from "react";

export default function useServerAction() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const wrappedTransition = (callback: () => Promise<unknown>, onError?: (message: string) => void) => {
    setErrorMessage(null);
    setIsSuccess(false);
    return startTransition(async () => {
      try {
        await callback();
        setIsSuccess(true);
      } catch (err) {
        if (err instanceof Error) {
          const message = err.message ?? "Unknown error occurred.";
          setErrorMessage(message);
          onError?.(message);
          console.error("Error caught in useServerAction hook: ", message);
          console.error(err);
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
