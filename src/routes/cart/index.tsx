import { createContext, useContext, useEffect, useState } from "react";
import z from "zod";
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import PageSetup from "@/components/layout/PageSetup";
import { useServerAction } from "@/hooks";
import type { paths } from "@/api/schema";
import type { Flatten } from "@/types/utilities";
import { ClearUserCart, GetUserCart, GetUserCartSize } from "@/lib/actions/userAction";
import { cn, formatCurrency, PreventLayoutFlash } from "@/lib/utils";

import SectionCard from "@/components/common/SectionCard";
import ImagePromise from "@/components/common/ImagePromise";
import { queryClient, ServerImagePath } from "@/lib/serverRequest";
import PaginationComponent from "@/components/common/PaginationComponent";
import { useSuspenseQuery } from "@tanstack/react-query";
import { QueryKeys } from "@/lib/queryKeys";

import {
	Loader as LoaderIcon,
	LoaderCircle,
    CameraOff as ThumbnailNotFoundIcon,
	Info as InfoIcon,
	Receipt as ProceedToCheckoutItem,
	X as XIcon,
	Undo2 as ReturnIcon
} from "lucide-react";
import { NumberButtonInput } from "@/components/forms";
import Separator from "@/components/common/Separator";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import Button from "@/components/button";

const cartSearchSchema = z.object({
	offset: z.number().min(1).optional()
});

export const Route = createFileRoute('/cart/')({
	component: RouteComponent,
	validateSearch: cartSearchSchema
})

function RouteComponent() {
	return (
		<PageSetup
			mainContent={MainContent}
		/>
	)
}

type TData = Required<paths['/api/User/cart']['get']['responses']['200']['content']['application/json']>;
type TDataItems = Required<TData>['items'];

type TCartPageContext = {
	isActionPending: boolean
};

const CartPageContext = createContext<TCartPageContext>({
	isActionPending: false
});

function useCartSize() {
	return useSuspenseQuery({
        queryKey: QueryKeys.User.CartSize,
        queryFn: async() => {
            const d = await GetUserCartSize();
            return d;
        },
    }, queryClient);
}

function MainContent() {
	const [ isPending, startTransition, errorMessage ] = useServerAction();
	const [ data, setData ] = useState<TData | null>(null);
	const search = Route.useSearch();

	const { data: cartSize } = useCartSize();

	useEffect(() => {
		startTransition(async () => {
			const data = await PreventLayoutFlash(GetUserCart(search.offset));
			setData(data as TData);
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [search.offset]);

	const ctx: TCartPageContext = {
		isActionPending: isPending
	}

	if (data !== null && cartSize < 1) {
		return (
			<SectionCard className="grow-0 shrink-1 self-center">
				<p>Your cart is currently empty.</p>
			</SectionCard>
		)
	}

	return (
		<CartPageContext.Provider value={ctx}>
			<div>
				{
					(isPending && data === null)
					? (
						<SectionCard>
							Loading...
						</SectionCard>
					)
					: errorMessage
						? (
							<div className="bg-error text-error-content border border-error-content/25 px-3 py-2 rounded-box">
								<h1 className="font-bold">
									Error fetching cart:
								</h1>

								<p>
									{ errorMessage } lorem ipsum
								</p>
							</div>
						)
						: data && <CartComponent data={data} />
				}
			</div>
		</CartPageContext.Provider>
	)
}

function CartComponent({
	data
}: {
	data: TData
}) {
	const totalPrice = formatCurrency(data.totalCost ?? 0);
	const isDiscount = (data.totalCost ?? 0) !== (data.discountedCost ?? 0);
	const formattedDiscount = isDiscount ? formatCurrency(data.discountedCost ?? 0) : null;

	const { isActionPending } = useContext(CartPageContext);

	return (
		<div className="flex gap-4 items-start">
			<SectionCard
				className="relative p-4"
			>
				<ItemList
					items={data.items}
				/>

				{ isActionPending && (
					<div
						className="absolute top-0 left-0 size-full flex items-center justify-center bg-black/50 rounded-box"
					>
						<LoaderIcon className="animate-spin stroke-base-200 size-24" />
					</div>
				)}
			</SectionCard>

			<SectionCard
				className="flex flex-col grow-0 shrink-0 w-96 p-4"
			>
				<div>
					<h2 className="font-medium">
						Total price
					</h2>

					<p className={cn("text-2xl font-bold", isDiscount && "line-through text-base-400 text-xl")}>
						{ totalPrice }
					</p>
				</div>

				{ isDiscount && (
					<div>
						<h2 className="font-medium">
							Your price
						</h2>

						<p className="text-2xl font-bold text-success-content">
							{ formattedDiscount }
						</p>
					</div>
				)}

				<div className="flex flex-col gap-4 mt-4">
					<Link className="btn" to="/">
						<ReturnIcon />
						Continue shopping
					</Link>

					<span
						className="btn btn-primary"
					>
						<ProceedToCheckoutItem />
						Proceed to checkout
					</span>
				</div>

				<Separator orientation="horizontal" />

				<CartClearDialog>
					<button className="btn btn-destructive">
						<XIcon />
						Clear cart
					</button>
				</CartClearDialog>
			</SectionCard>
		</div>
	)
}

function CartClearDialog({ children }: { children: React.ReactNode }) {
	const navigate = useNavigate();
	const { isActionPending } = useContext(CartPageContext);
	const [ isOpen, setIsOpen ] = useState<boolean>(false);
	const [ isPending, startTransition, errorMessage ] = useServerAction();

	const handleDialogTrigger = (newVal: boolean) => {
		if (isOpen && isPending) return;
		if (!isOpen && isActionPending) return;
		setIsOpen(newVal);
	}

	const handleClearUserCart = () => {
		if (isPending || isActionPending) return;
		startTransition(async () => {
			await ClearUserCart();
			navigate({ to: ".", reloadDocument: true });
		});
	}

	return (
		<AlertDialog.Root open={isOpen} onOpenChange={handleDialogTrigger}>
			<AlertDialog.Trigger asChild>
				{ children }
			</AlertDialog.Trigger>

			<AlertDialog.Portal>
				<AlertDialog.Overlay className="fixed inset-0 bg-black/25">
					<AlertDialog.Content
						className={cn(
							"fixed left-1/2 top-1/2 max-w-[90vw] w-[600px] -translate-y-1/2 -translate-x-1/2 bg-base-200 text-base-500 rounded-box",
							"shadow-md p-4 relative animate-dialogEntry"
						)}
					>
						<AlertDialog.Title className="text-lg font-medium mb-2">
							Are you sure?
						</AlertDialog.Title>

						<AlertDialog.Description>
							<p>
								This will remove all of your items from your cart.
								This action is irreversible.
							</p>
						</AlertDialog.Description>

						<AlertDialog.Cancel className="absolute top-2 right-2" asChild>
							<button className="text-base-500 cursor-pointer">
								<XIcon size={24} strokeWidth={3} />
							</button>
						</AlertDialog.Cancel>

						<div className="flex gap-4 w-full mt-4 justify-end">
							<AlertDialog.Cancel asChild>
								<Button
									disabled={isPending}
								>
									Cancel
								</Button>
							</AlertDialog.Cancel>

							<AlertDialog.Action asChild>
								<Button
									className="btn-destructive"
									disabled={isPending || isActionPending}
									onClick={handleClearUserCart}
								>
									{ isPending && <LoaderCircle className="animate-spin" /> }
									Understood, proceed
								</Button>
							</AlertDialog.Action>
						</div>
					</AlertDialog.Content>
				</AlertDialog.Overlay>
			</AlertDialog.Portal>
		</AlertDialog.Root>
	)
}

function ItemList({
	items
}: {
	items: TDataItems
}) {
	const { offset } = Route.useSearch();
	const [ delayedOffset, setDelayedOffset ] = useState<number | undefined>(offset);

	const { data: cartSize } = useCartSize();

	const { isActionPending } = useContext(CartPageContext);

	useEffect(() => {
		if (isActionPending === false) {
			setDelayedOffset(offset);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isActionPending]);

	return (
		<div>
			<h1 className="text-lg font-bold mb-4">
				Your shopping cart
			</h1>

			<div className="flex flex-col gap-2">
				{ items.map((item, idx) => (
					<ShoppingCartItem
						key={item.id}
						data={item as any}
					/>
				)) }

				{ items.length === 0 && (
					<div className="flex items-center grow-1 shrink-1">
						<InfoIcon
							className="stroke-base-200 fill-base-300 size-12 mr-4"
						/>
						<p>
							No items found.
						</p>
					</div>
				)}

				<PaginationComponent
					currentOffset={delayedOffset}
					totalPages={Math.ceil((cartSize ?? 1) / 10)}
					disabled={isActionPending}
				>
					<PaginationComponent.Label />
				</PaginationComponent>
			</div>
		</div>
	)
}

function ShoppingCartItem({
	data
}: {
	data: Omit<Required<Flatten<TDataItems>>, "user">
}) {
	const { product } = data;
	const quantity = Math.max(data.quantity, 1);
	const totalPrice = (product?.price ?? 0) * quantity;
	const formattedBasePrice = formatCurrency(totalPrice);
	const discountedPrice = (product && product.discount)
		? (totalPrice) * (100 - (product.discount ?? 0)) / 100
		: null;
	const formattedDiscount = discountedPrice && formatCurrency(discountedPrice);

	function FallbackElement() {
        return (
            <div
                className="flex items-center justify-center bg-base-100 size-full"
            >
                <ThumbnailNotFoundIcon className="size-16 stroke-base-400" />
            </div>
        )
    }

	function LinkWrapper({ children }: React.ComponentPropsWithRef<typeof Link>) {
		return (
			<Link
				to="/item/$itemId"
				params={{ itemId: product?.id ?? "undefined" }}
				className="text-primary-300 outline-0"
				tabIndex={-1}
			>
				{ children }
			</Link>
		)
	}

	return (
		<div className="flex gap-4">
			<LinkWrapper>
				<div
					className="relative size-24 overflow-hidden rounded-box group"
					tabIndex={0}
				>
					{ product?.thumbnailUrl ? (
						<ImagePromise
							src={ServerImagePath("/files/thumbnails/product/{FileName}", { path: { FileName: product?.thumbnailUrl } })}
						/>
					): <FallbackElement /> }

					<button
						className="flex items-center justify-center p-px opacity-25 group-hover:opacity-100 focus:ring-4 cursor-pointer absolute top-1 right-1 bg-destructive-content text-destructive rounded-full"
						tabIndex={0}
					>
						<XIcon />
					</button>
				</div>
			</LinkWrapper>

			<div className="grow-1 shrink-1 py-2 overflow-hidden">
				<h2 className="line-clamp-2">
					<LinkWrapper>
						{ product?.name }
					</LinkWrapper>
				</h2>

				<p
					className={cn(
						discountedPrice
							? "line-through text-base-400"
							: "text-lg font-medium"
					)}
				>
					{ formattedBasePrice }
				</p>

				{ discountedPrice && (
					<p
						className="text-lg font-medium"
					>
						{ formattedDiscount }
					</p>
				)}
			</div>

			<div
				className="flex flex-col grow-0 shrink-0 text-right self-center items-end"
			>
				<div>
					<label className="text-sm font-bold">
						Quantity
					</label>

					<NumberButtonInput
						defaultValue={data.quantity}
					/>
				</div>
			</div>
		</div>
	)
}
