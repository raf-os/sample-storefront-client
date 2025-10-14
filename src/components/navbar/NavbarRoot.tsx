import { cn } from "@/lib/utils";
import Button from "@/components/button";
import SearchBar from "@/components/forms/SearchBar";
import { UserRound } from "lucide-react";
import { Link } from "@tanstack/react-router";

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
                <Link
                    to="/"
                >
                <div className="flex items-center gap-4">
                    <img src="images/fake-logo.svg" alt="Fake company logo" className="size-[32px]" />
                    <div className="font-bold text-lg">Fake Company (tm)</div>
                </div>
                </Link>

                <div className="grow-1 shrink-1 flex">
                    <SearchBar />
                </div>

                <div className="flex items-center gap-2">
                    <div
                        className="flex items-center justify-center size-10 rounded-full outline-2 outline-base-400 overflow-hidden"
                    >
                        <UserRound className="grow-1 shrink-1 size-3/4 stroke-2 stroke-base-400" />
                    </div>
                    <Button className="btn-ghost">Log In</Button>
                    <Button className="btn-primary">Sign Up</Button>
                </div>
            </div>
        </nav>
    )
}