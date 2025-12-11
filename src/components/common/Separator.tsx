import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "@/lib/utils";

export default function Separator({
    className,
     ...rest
}: React.ComponentPropsWithRef<typeof SeparatorPrimitive.Root>) {
    return (
        <SeparatorPrimitive.Root
            className={cn(
                "bg-base-300 separator",
                className
            )}
            {...rest}
        />
    )
}