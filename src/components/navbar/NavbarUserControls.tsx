// TODO: This

import { useState, useTransition, useContext, createContext, type ComponentPropsWithRef } from "react";
import { Link } from "@tanstack/react-router";

import { useAuth } from "@/hooks";
import { AuthContext } from "@/authContext";
import { cn } from "@/lib/utils";

import * as Popover from "@radix-ui/react-popover";

import { ShoppingBasket, Shield } from "lucide-react";

type TMenuContext = {
    handleClose?: () => void,
}

const MenuContext = createContext<TMenuContext>({});

export default function NavbarUserControls() {
    const [ isOpen, setIsOpen ] = useState<boolean>(false);
    const [ isLogoutPending, startLogoutTransition ] = useTransition();
    const { authData, isAuthModerator, isAuthAdmin } = useAuth();
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

    const handleClose = () => {
        setIsOpen(false);
    }

    const ctx = { handleClose };

    return (
        <div className="flex gap-4 items-center">
            <div className="flex gap-1 items-center">
                { isAuthModerator() && (
                    <Shield
                        className={cn(
                            "fill-primary-300 stroke-0 size-5",
                            isAuthAdmin() && "fill-amber-400"
                        )}
                    />
                ) }
                <p className="text-primary-300 font-bold">{ authData?.userName }</p>
            </div>

            <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
                <Popover.Trigger asChild>
                    <button className="cursor-pointer">
                        <img src="/images/defaultProfileIcon.webp" className="size-8 outline-2 outline-primary-300 outline-offset-2 rounded-full" />
                    </button>
                </Popover.Trigger>

                <Popover.Portal>
                    <Popover.Content
                        className="bg-base-200 border border-base-300 rounded-box shadow-sm"
                        sideOffset={6}
                    >
                        <MenuContext.Provider value={ctx}>
                        <ul className="flex flex-col gap-2 p-1">
                            <MenuItem>
                                <Link to="/app/user">Account settings</Link>
                            </MenuItem>

                            <MenuItem>
                                <Link to="/app/user/products">View my listings</Link>
                            </MenuItem>

                            <div className="h-px bg-base-300" />

                            <MenuItem>
                                <button
                                    onClick={onLogoutRequest}
                                    className={cn(
                                        "text-destructive-content",
                                        isLogoutPending ? "opacity-50 cursor-progress" : "cursor-pointer"
                                    )}
                                    disabled={isLogoutPending}
                                >
                                    Log out
                                </button>
                            </MenuItem>
                        </ul>
                        </MenuContext.Provider>

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

function MenuItem({
    children,
    onClick,
    className,
    ...rest
}: ComponentPropsWithRef<'li'>) {
    const { handleClose } = useContext(MenuContext);

    const handleItemClick = (e: React.MouseEvent<HTMLLIElement>) => {
        handleClose?.();
        onClick?.(e);
    }

    return (
        <li
            onClick={handleItemClick}
            className={cn(
                "px-2 py-1",
                className
            )}
            {...rest}
        >
            { children }
        </li>
    )
}