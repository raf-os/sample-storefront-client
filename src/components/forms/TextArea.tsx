import { cn } from "@/lib/utils";

export type InputProps = React.ComponentPropsWithRef<'textarea'>;

export default function TextArea({
    className,
    ...rest
}: InputProps) {
    return (
        <textarea
            data-role="textarea-field"
            className={cn(
                "bg-base-200 text-base-500 rounded-field px-3 py-2 border border-base-300 outline-none resize-none",
                "focus:ring-2 focus:ring-base-500 aria-invalid:ring-2 aria-invalid:ring-destructive-content",
                className
            )}
            { ...rest }
        />
    )
}