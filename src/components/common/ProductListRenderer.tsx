import { GetProductListPage, type TProductListPageResponse } from "@/lib/actions/productActions";
import { useServerAction } from "@/hooks";
import { cn, formatCurrency } from "@/lib/utils";
import type { TProductListItem } from "@/models";
import type { Flatten } from "@/types/utilities";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

import ShopItemCard from "@/components/shop-item/ShopItemCard";

const DEFAULT_LIST_SIZE = 10;

export type ProductListRendererProps = {
    offset?: number,
}

export default function ProductListRenderer({
    offset
}: ProductListRendererProps) {
    const [ productListData, setProductListData ] = useState<TProductListPageResponse | null>(null);
    const [ isPending, startTransition, errorMessage, clearError ] = useServerAction();

    useEffect(() => {
        startTransition(async () => {
            const data = await GetProductListPage({ offset: offset });
            if (!data.success) throw new Error(data.message ?? "Unknown error occurred.");

            setProductListData(data.data ?? null);
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ offset ]);

    return (
        <div className="flex flex-col gap-4">
            { errorMessage && (
                <p className="text-sm text-destructive-content">
                    { errorMessage }
                </p>
            )}
            <ProductList items={productListData?.items} />

            { (productListData?.totalPages !== undefined) && <PaginationComponent currentOffset={offset} totalPages={productListData.totalPages} /> }
        </div>
    )
}

type ProductListProps = {
    items?: TProductListPageResponse['items']
}

function ProductList({
    items
}: ProductListProps) {
    return (
        <ul
            className="grid grid-cols-4 gap-4"
        >
            { (items === undefined || items === null)
                ? (
                    <LoadingFallback />
                )
                : items.map((item) => (
                    <ItemRender
                        data={item}
                    />
                ))
            }
        </ul>
    )
}

function LoadingFallback() {
    return (
        <>
            { [...Array(DEFAULT_LIST_SIZE)].map((_, idx) => (
                <ItemLoadingFallback key={idx} />
            )) }
        </>
    )
}

function ItemLoadingFallback() {
    return (
        <li
            className="w-full h-64 bg-base-400/50 rounded-box animate-pulse"
        />
    )
}

type ItemRenderProps = {
    data: Flatten<TProductListPageResponse['items']>
}

function ItemRender({
    data
}: ItemRenderProps) {
    const { product, commentCount } = data;
    return (
        <>
            <ShopItemCard
                itemId={ product.id }
                itemLabel={ product.name }
                itemPrice={ product.price }
                itemDiscount={ product.discount }
            />
        </>
    )
}

type PaginationItemRenderProps = {
    selectionId: number,
    currentSelection: number,
}

function PaginationItemRender({
    selectionId,
    currentSelection
}: PaginationItemRenderProps) {
    return (
        <li
            tabIndex={0}
            className={cn(
                "min-w-12 px-2 py-1 text-center border rounded-field shadow-xs cursor-pointer select-none transition-all outline-none focus:ring-3 ring-base-400",
                currentSelection === selectionId
                    ? "font-bold bg-base-500 text-base-200 border-base-500"
                    : "text-base-400 border-base-400 bg-base-100 hover:bg-base-200"
            )}
        >
            { selectionId }
        </li>
    )
}

type PaginationComponentProps = {
    currentOffset?: number,
    totalPages: number,
}

function PaginationComponent({
    currentOffset = 1,
    totalPages
}: PaginationComponentProps) {
    const pages = 10;
    return (
        <nav className="w-full flex justify-center items-center">
            <ol className="flex gap-2">
                { [...Array(pages)].map((_, idx) => (
                    <PaginationItemRender key={idx} selectionId={idx + 1} currentSelection={currentOffset} />
                )) }
            </ol>
        </nav>
    )
}