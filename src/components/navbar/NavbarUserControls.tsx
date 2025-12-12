// TODO: This

import { useState, useTransition, useContext, createContext, type ComponentPropsWithRef } from "react";
import { Link } from "@tanstack/react-router";

import { useAuth } from "@/hooks";
import { AuthContext } from "@/authContext";
import { cn } from "@/lib/utils";

import * as Dropdown from "@radix-ui/react-dropdown-menu";

import { DropdownContent, DropdownItem as DropdownItemOriginal, DropdownSeparator } from "@/components/common/Dropdown";

import { ShoppingBasket, Shield } from "lucide-react";
import UserAvatar from "@/components/common/UserAvatar";

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
                { authData && (
                    <p className="text-primary-300 font-bold">
                        <Link to="/user/$userId" params={{ userId: authData.userId }}>
                            { authData.userName }
                        </Link>
                    </p>
                )}
            </div>

            <Dropdown.Root open={isOpen} onOpenChange={setIsOpen}>
                <Dropdown.Trigger asChild>
                    <button className="cursor-pointer rounded-full outline-2 outline-base-500 p-0.5 bg-base-100">
                        <UserAvatar userId={authData?.userId} size={32} className="rounded-full" />
                    </button>
                </Dropdown.Trigger>

                <Dropdown.Portal>
                    <DropdownContent
                        sideOffset={6}
                    >
                        <MenuContext.Provider value={ctx}>
                            <DropdownItem>
                                <Link to="/app/user">Account settings</Link>
                            </DropdownItem>

                            <DropdownItem>
                                <Link to="/app/user/products">View my listings</Link>
                            </DropdownItem>

                            <DropdownSeparator />

                            <DropdownItem variant="destructive">
                                <button
                                    onClick={onLogoutRequest}
                                    className={cn(
                                        isLogoutPending ? "opacity-50 cursor-progress" : "cursor-pointer"
                                    )}
                                    disabled={isLogoutPending}
                                >
                                    Log out
                                </button>
                            </DropdownItem>
                        </MenuContext.Provider>

                        <Dropdown.Arrow />
                    </DropdownContent>
                </Dropdown.Portal>
            </Dropdown.Root>
            
            <div className="relative flex size-8 items-center justify-center rounded-full outline-2 outline-base-500 bg-base-300 outline-offset-2">
                <ShoppingBasket className="grow-0 shrink-0 text-base-500" />
            </div>
        </div>
    )
}

function DropdownItem({onSelect, ...rest}: React.ComponentPropsWithRef<typeof DropdownItemOriginal>) {
    const { handleClose } = useContext(MenuContext);

    const handleClick = (e: Event) => {
        e.preventDefault();
        if (onSelect) {
            onSelect(e);
            return;
        }
        handleClose?.();
    }

    return <DropdownItemOriginal onSelect={handleClick} {...rest} />
}