import { cn } from "@/lib/utils";

export type ButtonProps = React.ComponentPropsWithRef<'button'>;

export default function Button({
    className,
    type="button",
    children,
    ...rest
}: ButtonProps) {
    return (
        <button
            type={type}
            className={cn(
                "bg-primary hover:bg-primary-2 text-primary-content font-bold px-5 py-2 rounded-field",
                className
            )}
            {...rest}
        >
            {children}
        </button>
    )
}