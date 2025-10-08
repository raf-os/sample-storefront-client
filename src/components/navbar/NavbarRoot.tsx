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
                <div className="flex items-center gap-4 text-lg">
                    <img src="images/fake-logo.svg" alt="Fake company logo" className="size-[32px]" />
                    <div className="font-bold">Fake Company (tm)</div>
                </div>

                <div className="flex gap-2">
                    <Button>Log In</Button>
                    <Button>Sign Up</Button>
                </div>
            </div>
        </nav>
    )
}