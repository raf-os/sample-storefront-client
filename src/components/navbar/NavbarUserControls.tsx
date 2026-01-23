// TODO: This

import { useState, useTransition, useContext, createContext } from "react";
import { Link } from "@tanstack/react-router";

import { useAuth } from "@/hooks";
import { AuthContext } from "@/authContext";
import { cn } from "@/lib/utils";

import * as Dropdown from "@radix-ui/react-dropdown-menu";

import { DropdownContent, DropdownItem as DropdownItemOriginal, DropdownSeparator } from "@/components/common/Dropdown";
import NavbarCart from "@/components/navbar/NavbarCart";

import { ShoppingBasket, Shield, Mail } from "lucide-react";
import UserAvatar from "@/components/common/UserAvatar";
import { queryClient } from "@/lib/serverRequest";
import { GetUserCartSize } from "@/lib/actions/userAction";
import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "@/lib/queryKeys";

type TMenuContext = {
    handleClose?: () => void,
}

const MenuContext = createContext<TMenuContext>({});

export default function NavbarUserControls() {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isLogoutPending, startLogoutTransition] = useTransition();
    const { authData, isAuthModerator, isAuthAdmin } = useAuth();
    const { logout } = useContext(AuthContext);

    const onLogoutRequest = () => {
        if (isLogoutPending) return;

        startLogoutTransition(async () => {
            const res = await logout();
            handleClose();

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
                {isAuthModerator() && (
                    <Shield
                        className={cn(
                            "fill-primary-300 stroke-0 size-5",
                            isAuthAdmin() && "fill-amber-400"
                        )}
                    />
                )}
                {authData && (
                    <p className="text-primary-300 font-bold">
                        <Link to="/user/$userId" params={{ userId: authData.userId }}>
                            {authData.userName}
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

            <Dropdown.Root>
                <Dropdown.Trigger asChild>
                    <button
                        className="cursor-pointer rounded-full outline-2 outline-base-500 p-0.5 bg-base-100"
                    >
                        <Mail
                        />
                    </button>
                </Dropdown.Trigger>

                <Dropdown.Portal>
                    <DropdownContent
                        sideOffset={6}
                    >
                        content here
                    </DropdownContent>
                </Dropdown.Portal>
            </Dropdown.Root>
            <UserCartControls />
        </div>
    )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function DropdownItem({ onSelect, asChild: _, ...rest }: React.ComponentPropsWithRef<typeof DropdownItemOriginal>) {
    const { handleClose } = useContext(MenuContext);

    const handleClick = (e: Event) => {
        e.preventDefault();
        if (onSelect) {
            onSelect(e);
            return;
        }
        handleClose?.();
    }

    return <DropdownItemOriginal onSelect={handleClick} asChild {...rest} />
}

function UserCartControls() {
    const { token } = useContext(AuthContext);
    const { data: cartSize, isSuccess, isError } = useQuery({
        queryKey: QueryKeys.User.CartSize,
        queryFn: async () => {
            const d = await GetUserCartSize();
            return d;
        },
        enabled: () => { return token !== undefined && token !== null; },
    }, queryClient);

    return (
        <div className="relative">
            <NavbarCart cartSize={cartSize ?? 0} asChild>
                <button className="flex items-center justify-center rounded-full border-2 border-base-500 bg-base-100 p-[2px] size-10 cursor-pointer">
                    <ShoppingBasket className="size-full text-base-500 bg-base-300 rounded-full p-[2px]" />
                </button>
            </NavbarCart>

            <div
                className={cn(
                    "flex items-center justify-center absolute bottom-0 right-0 select-none leading-none font-bold text-xs bg-base-500 text-base-200 size-4 rounded-full",
                    isError && "bg-error text-error-content"
                )}
            >
                {isSuccess
                    ? cartSize
                    : isError
                        ? "!"
                        : "-"
                }
            </div>
        </div>
    )
}
