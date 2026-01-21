import type { paths } from "@/api/schema";
import { GetUserCartPreview } from "@/lib/actions/userAction";
import { QueryKeys } from "@/lib/queryKeys";
import { queryClient, ServerImagePath } from "@/lib/serverRequest";
import * as Popover from "@radix-ui/react-popover";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import type { Flatten } from "@/types/utilities";
import { formatCurrency, PreventLayoutFlash } from "@/lib/utils";
import ImagePromise from "@/components/common/ImagePromise";
// import { useAuth } from "@/hooks";

import {
    CameraOff as ThumbnailNotFoundIcon
} from "lucide-react";
import { Link } from "@tanstack/react-router";

type TCartItemAlias = Required<Omit<Flatten<Required<paths['/api/User/cart']['get']['responses']['200']['content']['application/json']>['items']>, 'user'>>;

export default function NavbarCart({
    children,
    cartSize,
    ...rest
}: React.ComponentPropsWithRef<typeof Popover.Trigger> & { cartSize: number }) {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    // const { authData } = useAuth();

    const { data: cartItems, isPending, isError, isSuccess } = useQuery({
        queryKey: QueryKeys.User.CartPreview,
        queryFn: async () => {
            const d = await PreventLayoutFlash(GetUserCartPreview());
            console.log(d);
            return d;
        },
        enabled: isOpen === true
    }, queryClient);

    const handlePopoverClose = () => {
        setIsOpen(false);
    }

    const cartOverflow = Math.max(cartSize - 5, 0);

    return (
        <Popover.Root
            open={isOpen}
            onOpenChange={setIsOpen}
        >
            <Popover.Trigger
                {...rest}
            >
                {children}
            </Popover.Trigger>

            <Popover.Portal>
                <Popover.Content
                    onOpenAutoFocus={e => e.preventDefault()}
                    sideOffset={6}
                    className="flex flex-col w-96 overflow-clip gap-2 bg-base-200 border border-base-300 shadow-xs rounded-box p-1 data-[state=open]:animate-slideUpAndFade"
                >
                    {isPending
                        ? (
                            <div>
                                Loading...
                            </div>
                        )
                        : (
                            isError
                                ? (
                                    <div>
                                        Error fetching data.
                                    </div>
                                )
                                : (
                                    isSuccess && (
                                        <div
                                            className="flex flex-col gap-2 p-1"
                                        >
                                            {cartItems.items?.map((item, _) => (
                                                <NavbarCartItem
                                                    data={item as TCartItemAlias}
                                                    key={item.id}
                                                    popoverCloseFn={handlePopoverClose}
                                                />
                                            ))}

                                            {cartOverflow > 0 && (
                                                <p className="text-sm text-base-500/75 text-center">
                                                    ... and {cartOverflow} extra items.
                                                </p>
                                            )}
                                        </div>
                                    )
                                )
                        )
                    }

                    <Link
                        className="btn btn-primary rounded-box-inner"
                        to="/cart"
                        onClick={handlePopoverClose}
                    >
                        View my cart
                    </Link>
                    <Popover.Arrow className="fill-base-500" />
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    )
}

function NavbarCartItem({
    data,
    popoverCloseFn
}: {
    data: TCartItemAlias,
    popoverCloseFn: () => void
}) {
    const { product } = data;
    console.log(product)

    const basePrice = product?.price ?? 0;
    const discountAmount = product?.discount ?? 0;
    const finalPrice = basePrice * (100 - discountAmount) / 100;

    const formattedPrice = formatCurrency(finalPrice);

    function FallbackElement() {
        return (
            <div
                className="flex items-center justify-center bg-base-300 size-full"
            >
                <ThumbnailNotFoundIcon className="size-6 stroke-base-500/50" />
            </div>
        )
    }

    return (
        <div className="flex gap-2 items-center group">
            <Link
                to={"/item/$itemId"}
                params={{ itemId: product?.id as string }}
                onClick={popoverCloseFn}
            >
                <div className="flex rounded-full overflow-hidden size-14">
                    {product?.thumbnailUrl ? (
                        <ImagePromise
                            src={product?.thumbnailUrl ? ServerImagePath("/files/thumbnails/product/{FileName}", { path: { FileName: product?.thumbnailUrl as string } }) : undefined}
                            fallback={<FallbackElement />}
                        />)
                        : <FallbackElement />
                    }
                </div>
            </Link>

            <div className="grow-1 shrink-1 group-hover:bg-primary-500 transition-colors duration-75 rounded-box px-2 py-1 overflow-x-hidden">
                <h1 className="font-semibold text-primary-300 w-full truncate">
                    <Link
                        to={"/item/$itemId"}
                        params={{ itemId: product?.id as string }}
                        onClick={popoverCloseFn}
                    >
                        {product?.name}
                    </Link>
                </h1>

                <div className="text-sm">
                    <p>
                        {formattedPrice} {discountAmount > 0 && <span className="text-success-content">(-{discountAmount}%)</span>}
                    </p>

                    <p>
                        Quantity: {data.quantity}
                    </p>
                </div>
            </div>
        </div>
    )
}
