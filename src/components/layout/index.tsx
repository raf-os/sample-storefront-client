import { cn } from "@/lib/utils";

type LayoutRootProps = React.ComponentPropsWithRef<'div'>;

function LayoutRoot({
    children
}: LayoutRootProps) {
    return (
        <div
            className="relative mx-auto w-full grow-1 shrink-1 flex gap-4 justify-between"
        >
            { children }
        </div>
    )
}

type LayoutMainProps = React.ComponentPropsWithRef<'div'>;

function LayoutMain({
    children,
    className
}: LayoutMainProps) {
    return (
        <div
            className={cn(
                "flex flex-col grow-1 shrink-1 p-2 gap-4",
                className
            )}
        >
            { children }
        </div>
    )
}

type LayoutSidebarProps = React.ComponentPropsWithRef<'div'>;

function LayoutLeftSidebar({
    children,
    className
}: LayoutSidebarProps) {
    return (
        <div
            className={cn(
                "flex flex-col grow-0 shrink-0 w-[320px] p-4 border-r border-base-200",
                className
            )}
        >
            { children }
        </div>
    )
}

function LayoutRightSidebar({
    children,
    className
}: LayoutSidebarProps) {
    return (
        <div
            className={cn(
                "flex flex-col grow-0 shrink-0 w-[320px] p-4",
                className
            )}
        >
            { children }
        </div>
    )
}

const Layout = {
    Root: LayoutRoot,
    Main: LayoutMain,
    LeftSidebar: LayoutLeftSidebar,
    RightSidebar: LayoutRightSidebar
}

export default Layout;