import { useEffect, useState } from "react";
import z from "zod";
import { createFileRoute, Link } from '@tanstack/react-router';
import PageSetup from "@/components/layout/PageSetup";
import { useServerAction } from "@/hooks";
import type { paths } from "@/api/schema";
import type { Flatten } from "@/types/utilities";
import { GetUserCart } from "@/lib/actions/userAction";
import { cn, formatCurrency, PreventLayoutFlash } from "@/lib/utils";

import SectionCard from "@/components/common/SectionCard";
import ImagePromise from "@/components/common/ImagePromise";
import { ServerImagePath } from "@/lib/serverRequest";
import {
    CameraOff as ThumbnailNotFoundIcon
} from "lucide-react";

const cartSearchSchema = z.object({
	offset: z.number().min(1).optional()
});

type CartSearch = z.infer<typeof cartSearchSchema>;

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

function MainContent() {
	const [ isPending, startTransition, errorMessage ] = useServerAction();
	const [ data, setData ] = useState<TData | null>(null);
	const search = Route.useSearch();

	useEffect(() => {
		startTransition(async () => {
			const data = await PreventLayoutFlash(GetUserCart(search.offset));
			console.log(data);
			setData(data as TData);
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [search.offset]);

	return (
		<div>
			{
				isPending
				? (<div>Loading...</div>)
				: errorMessage
					? (<div>Error</div>)
					: data && <CartComponent data={data} />
			}
		</div>
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

	return (
		<div className="flex gap-4 items-start">
			<SectionCard>
				<ItemList
					items={data.items}
				/>
			</SectionCard>

			<SectionCard
				className="grow-0 shrink-0 w-96 px-3 py-2"
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
			</SectionCard>
		</div>
	)
}

function ItemList({
	items
}: {
	items: TDataItems
}) {
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
				className="text-primary-300"
			>
				{ children }
			</Link>
		)
	}

	return (
		<div className="flex gap-4">
			<LinkWrapper>
				<div
					className="size-24 overflow-hidden rounded-box"
				>
					{ product?.thumbnailUrl ? (
						<ImagePromise
							src={ServerImagePath("/files/thumbnails/product/{FileName}", { path: { FileName: product?.thumbnailUrl } })}
						/>
					): <FallbackElement /> }
				</div>
			</LinkWrapper>

			<div className="grow-1 shrink-1 py-2 overflow-hidden">
				<h2 className="line-clamp-2">
					<LinkWrapper>
						{ product?.name }
					</LinkWrapper>

					{ quantity > 1 && (
						<span className="text-sm opacity-75"> (x { quantity })</span>
					)}
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
		</div>
	)
}
