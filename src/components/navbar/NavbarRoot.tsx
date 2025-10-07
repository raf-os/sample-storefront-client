import { cn } from "@/lib/utils";
import Button from "@/components/button";

export type NavbarRootProps = React.ComponentPropsWithRef<'nav'>;

export default function NavbarRoot({ className, ...rest }: NavbarRootProps) {
    return (
        <nav
            className={cn(
                "sticky",
                className
            )}
            {...rest}
        >
            <div className="mx-auto w-[1024px] h-24 flex items-center justify-between text-base-content">
                <div className="text-xl font-medium">
                    Fake Company (tm)
                </div>

                <div className="flex gap-2">
                    <Button>Sign In</Button>
                    <Button>Sign Up</Button>
                </div>
            </div>
        </nav>
    )
}