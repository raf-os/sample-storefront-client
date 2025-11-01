import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";

export type ButtonProps = React.ComponentPropsWithRef<'button'> & { asChild?: boolean };

export default function Button({
    className,
    type="button",
    children,
    asChild,
    ...rest
}: ButtonProps) {
    const Comp = asChild ? Slot : "button";
    return (
        <Comp
            type={type}
            className={cn(
                "btn",
                className
            )}
            {...rest}
        >
            {children}
        </Comp>
    )
}