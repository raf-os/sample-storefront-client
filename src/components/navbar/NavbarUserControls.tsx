// TODO: This

import { useState, useTransition, useContext } from "react";
import { Link } from "@tanstack/react-router";

import { useAuth } from "@/hooks";
import { AuthContext } from "@/authContext";
import { cn } from "@/lib/utils";

import * as Popover from "@radix-ui/react-popover";

import { ShoppingBasket } from "lucide-react";

export default function NavbarUserControls() {
    const [ isOpen, setIsOpen ] = useState<boolean>(false);
    const [ isLogoutPending, startLogoutTransition ] = useTransition();
    const { authData } = useAuth();
    const { logout } = useContext(AuthContext);

    const onLogoutRequest = () => {
        if (isLogoutPending) return;

        startLogoutTransition(async () => {
            const res = await logout();

            if (res.success) {
                window.location.reload();
            }
        });
    }

    return (
        <div className="flex gap-4 items-center">
            <p className="text-primary-300 font-bold">
                { authData?.userName }
            </p>

            <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
                <Popover.Trigger asChild>
                    <button>
                        <img src="/images/defaultProfileIcon.webp" className="size-8 outline-2 outline-primary-300 outline-offset-2 rounded-full" />
                    </button>
                </Popover.Trigger>

                <Popover.Portal>
                    <Popover.Content
                        className="bg-base-200 rounded-box px-4 py-4 shadow-md"
                    >
                        <ul className="flex flex-col gap-2 leading-none">
                            <li>
                                <Link to="/app/user">Account settings</Link>
                            </li>

                            <div className="h-px bg-base-500" />

                            <li>
                                <button
                                    onClick={onLogoutRequest}
                                    className={cn(
                                        "text-error-content",
                                        isLogoutPending ? "opacity-50 cursor-progress" : "cursor-pointer"
                                    )}
                                    disabled={isLogoutPending}
                                >
                                    Log out
                                </button>
                            </li>
                        </ul>

                        <Popover.Arrow />
                    </Popover.Content>
                </Popover.Portal>
            </Popover.Root>
            
            <div className="relative flex size-8 items-center justify-center rounded-full outline-2 outline-base-500 bg-base-300 outline-offset-2">
                <ShoppingBasket className="grow-0 shrink-0 text-base-500" />
            </div>
        </div>
    )
}