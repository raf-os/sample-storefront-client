import { cn } from "@/lib/utils";

export type InputProps = React.ComponentPropsWithRef<'input'>;

export default function Input({
    className,
    ...rest
}: InputProps) {
    return (
        <input
            data-role="input-field"
            className={cn(
                "bg-base-100 text-base-500 rounded-field px-3 py-1 outline-base-500 focus:outline-2",
                className
            )}
            { ...rest }
        />
    )
}