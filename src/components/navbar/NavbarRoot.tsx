import { cn } from "@/lib/utils";
import SearchBar from "@/components/forms/SearchBar";
import { Link } from "@tanstack/react-router";

import NavbarAuth from "@/components/navbar/NavbarAuth";

export type NavbarRootProps = React.ComponentPropsWithRef<'nav'>;

export default function NavbarRoot({ className, ...rest }: NavbarRootProps) {
    return (
        <nav
            className="sticky top-0 z-1 bg-base-100"
            {...rest}
        >
            <div className={cn("mx-auto w-[1024px] h-24 flex gap-4 items-center justify-between text-base-content", className)}>
                <Link
                    to="/"
                >
                <div className="flex items-center gap-4">
                    <img src="/images/fake-logo.svg" alt="Fake company logo" className="size-[32px]" />
                    <div className="font-bold text-lg">Fake Company (tm)</div>
                </div>
                </Link>

                <div className="grow-1 shrink-1 flex">
                    <SearchBar />
                </div>

                <NavbarAuth />
            </div>
        </nav>
    )
}