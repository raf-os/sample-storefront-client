import { cn } from "@/lib/utils";
import * as Dropdown from "@radix-ui/react-dropdown-menu";

export function DropdownContent({ children, className, ...rest }: React.ComponentPropsWithRef<typeof Dropdown.Content>) {
    return (
        <Dropdown.Content
            className={cn(
                "flex flex-col bg-base-200 border border-base-300 shadow-sm rounded-box p-0.5 text-sm select-none",
                className
            )}
            { ...rest }
        >
            { children }
        </Dropdown.Content>
    )
}

export function DropdownItem({ children, className, variant="default", ...rest }: React.ComponentPropsWithRef<typeof Dropdown.Item> & {
    variant?: "default" | "destructive"
}) {
    const vp = {
        default: "text-base-500 data-[highlighted]:bg-primary-300 data-[highlighted]:text-base-200",
        destructive: "text-destructive-content data-[highlighted]:bg-destructive data-[highlighted]:text-destructive-content"
    };
    const variantProps = Object.hasOwn(vp, variant) ? vp[variant] : vp['default'];
    return (
        <Dropdown.Item
            className={cn(
                "text-right rounded-box-inner px-2 py-1.5 leading-none outline-none",
                "cursor-pointer data-[disabled]:opacity-50 data-[disabled]:cursor-default",
                variantProps,
                className
            )}
            {...rest}
        >
            { children }
        </Dropdown.Item>
    )
}

export function DropdownSeparator({ className, ...rest }: React.ComponentPropsWithRef<typeof Dropdown.Separator>) {
    return (
        <Dropdown.Separator className={cn("h-px bg-base-400 m-1", className)} {...rest} />
    )
}