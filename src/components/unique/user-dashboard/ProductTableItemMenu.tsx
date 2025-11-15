import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Ellipsis } from "lucide-react";

export type ProductTableItemMenuProps = {
    itemId: string,
}

export default function ProductTableItemMenu({
    itemId
}: ProductTableItemMenuProps) {
    return (
        <Dropdown.Root>
            <Dropdown.Trigger
                className="flex items-center p-0.5 justify-center border border-base-300 rounded-box shadow-xs outline-none focus:ring-2"
            >
                <Ellipsis />
            </Dropdown.Trigger>

            <Dropdown.Portal>
                <Dropdown.Content
                    className="bg-base-200 border border-base-300 rounded-box p-1 shadow-sm animate-slideUpAndFade"
                    sideOffset={6}
                >
                    <Link to="/item/$itemId" params={{ itemId }}>
                        <MenuItem>
                            View
                        </MenuItem>
                    </Link>

                    <MenuItem>
                        Edit
                    </MenuItem>

                    <MenuSeparator />

                    <AlertDialog.Root>
                        <AlertDialog.Trigger asChild>
                            <MenuItem variant="destructive" onSelect={e => e.preventDefault()}>
                                Delete
                            </MenuItem>
                        </AlertDialog.Trigger>

                        <AlertDialog.Portal>
                            <AlertDialog.Overlay
                                className="fixed inset-0 bg-black/25"
                            />
                            <AlertDialog.Content
                                className="fixed w-[520px] p-4 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-base-200 border border-base-300 shadow-md rounded-box animate-dialogEntry"
                            >
                                <AlertDialog.Title className="font-bold text-lg mb-2">
                                    Are you sure?
                                </AlertDialog.Title>

                                <AlertDialog.Description>
                                    <p>
                                        This action cannot be undone. Once this product is deleted,
                                        its listing and all its associated data will be removed from our servers.
                                    </p>
                                </AlertDialog.Description>

                                <div
                                    className="flex gap-2 justify-end mt-2"
                                >
                                    <AlertDialog.Cancel asChild>
                                        <button
                                            className="btn"
                                        >
                                            Cancel
                                        </button>
                                    </AlertDialog.Cancel>

                                    <AlertDialog.Action asChild>
                                        <button
                                            className="btn btn-destructive"
                                        >
                                            Yes, delete product listing
                                        </button>
                                    </AlertDialog.Action>
                                </div>
                            </AlertDialog.Content>
                        </AlertDialog.Portal>
                    </AlertDialog.Root>
                    <Dropdown.Arrow className="fill-base-300" />
                </Dropdown.Content>
            </Dropdown.Portal>
        </Dropdown.Root>
    )
}

type MenuItemProps = React.ComponentPropsWithRef<typeof Dropdown.Item> & {
    variant?: "base" | "destructive",
}

function MenuItem({
    children,
    className,
    variant="base",
    ...rest
}: MenuItemProps) {
    return (
        <Dropdown.Item
            className={cn(
                "px-2 cursor-pointer select-none rounded-box-inner data-[highlighted]:bg-primary-300 data-[highlighted]:text-primary-content outline-none",
                variant === "destructive" && "text-destructive-content data-[highlighted]:bg-destructive-content data-[highlighted]:text-destructive",
                className
            )}
            {...rest}
        >
            {children}
        </Dropdown.Item>
    )
}

function MenuSeparator({className, ...rest}: React.ComponentPropsWithRef<typeof Dropdown.Separator>) {
    return (
        <Dropdown.Separator
            className={cn(
                "w-full h-px bg-base-400 my-1",
                className
            )}
            {...rest}
        />
    )
}