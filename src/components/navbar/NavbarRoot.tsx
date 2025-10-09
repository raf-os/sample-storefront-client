import { cn } from "@/lib/utils";
import Button from "@/components/button";
import SearchBar from "@/components/forms/SearchBar";

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
            <div className="mx-auto w-[1024px] h-24 flex gap-4 items-center justify-between text-base-content">
                <div className="flex items-center gap-4 text-lg">
                    <img src="images/fake-logo.svg" alt="Fake company logo" className="size-[32px]" />
                    <div className="font-bold">Fake Company (tm)</div>
                </div>

                <div className="grow-1 shrink-1 flex">
                    <SearchBar />
                </div>

                <div className="flex gap-2">
                    <Button className="btn-outline">Log In</Button>
                    <Button className="btn-primary">Sign Up</Button>
                </div>
            </div>
        </nav>
    )
}