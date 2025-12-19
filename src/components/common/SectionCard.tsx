import { cn } from "@/lib/utils";

export default function SectionCard({
    children,
    className,
    ...rest
}: React.ComponentPropsWithRef<'div'>) {
    return (
        <div
            className={cn(
                "bg-base-200 border border-base-300 rounded-box p-2 shadow-sm grow-1 shrink-1",
                className
            )}
            {...rest}
        >
            { children }
        </div>
    )
}