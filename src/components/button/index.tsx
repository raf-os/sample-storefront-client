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
                "btn",
                className
            )}
            {...rest}
        >
            {children}
        </button>
    )
}