import { useCallback, useEffect, useState, useContext, createContext } from "react";

import { GetProductListPage, type TProductListPageResponse } from "@/lib/actions/productActions";
import { useServerAction } from "@/hooks";
import { cn } from "@/lib/utils";
import type { TProductListItem } from "@/models";
import type { Flatten } from "@/types/utilities";
import { Link } from "@tanstack/react-router";

import ShopItemCard from "@/components/shop-item/ShopItemCard";
import { ChevronsLeft, ChevronsRight } from "lucide-react";

const DEFAULT_LIST_SIZE = 10;
const MAX_PAGINATION_VISIBLE_PAGES = 9;

export type ProductListRendererProps = {
    offset?: number,
}

const ProductListContext = createContext({
    isPending: false
});

export default function ProductListRenderer({
    offset
}: ProductListRendererProps) {
    const [ productListData, setProductListData ] = useState<TProductListPageResponse | null>(null);
    const [ isPending, startTransition, errorMessage ] = useServerAction();

    useEffect(() => {
        startTransition(async () => {
            // await new Promise(resolve => setTimeout(resolve, 1000));
            const data = await GetProductListPage({ offset: offset });
            if (!data.success) throw new Error(data.message ?? "Unknown error occurred.");

            setProductListData(data.data ?? null);
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ offset ]);

    const ctx = {
        isPending
    };

    return (
        <ProductListContext value={ctx}>
            <div className="flex flex-col gap-4">
                { errorMessage && (
                    <p className="text-sm text-destructive-content">
                        { errorMessage }
                    </p>
                )}
                <ProductList items={productListData?.items} />

                { (productListData?.totalPages !== undefined) && <PaginationComponent currentOffset={offset} totalPages={productListData.totalPages} /> }
            </div>
        </ProductListContext>
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
                        key={item.product.id}
                    />
                ))
            }

            { (items && items.length === 0) && (
                <p>
                    No items found.
                </p>
            ) }
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
    const { isPending } = useContext(ProductListContext);
    return (
        <Link to="." search={prev => ({ ...prev, offset: selectionId })} disabled={isPending}>
            <li
                tabIndex={0}
                className={cn(
                    "min-w-12 px-2 py-1 text-center border rounded-field shadow-xs cursor-pointer select-none transition-all outline-none focus:ring-3 ring-base-400",
                    currentSelection === selectionId
                        ? "font-bold bg-base-500 text-base-200 border-base-500"
                        : "text-base-400 border-base-400 bg-base-100 hover:bg-base-200",
                    isPending && "opacity-25"
                )}
            >
                { selectionId }
            </li>
        </Link>
    )
}

function PaginationItemSkip({
    children,
    to
}: {
    children?: React.ReactNode,
    to: number
}) {
    const { isPending } = useContext(ProductListContext);

    return (
        <Link to="." search={prev => ({ ...prev, offset: to })} disabled={isPending}>
            <li className={cn(
                "[&>svg]:size-8 text-base-400 hover:text-base-500 transition-colors group-[disabled=true]:opacity-15",
                isPending && "opacity-25"
            )}
            >
                { children }
            </li>
        </Link>
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
    const _pagesMidpoint = Math.floor(MAX_PAGINATION_VISIBLE_PAGES / 2);
    const pages = totalPages;

    const PaginationElements = useCallback(() => {
        const elementList: React.ReactElement[]  = [];
        const lowestPage = Math.max(
            Math.min(
                currentOffset - _pagesMidpoint,
                pages - MAX_PAGINATION_VISIBLE_PAGES + 1
            ), 1);
        const highestPage = Math.min(
            pages,
            Math.max(
                currentOffset + _pagesMidpoint,
                MAX_PAGINATION_VISIBLE_PAGES
            )
        );

        for (let i = lowestPage; i <= highestPage; i++) {
            if (i === lowestPage && i> 1)
                elementList.push(<PaginationItemSkip to={1}><ChevronsLeft /></PaginationItemSkip>);

            elementList.push(<PaginationItemRender key={i} selectionId={i} currentSelection={currentOffset} />);

            if (i === highestPage && i < pages)
                elementList.push(<PaginationItemSkip to={pages}><ChevronsRight /></PaginationItemSkip>);
        }

        return elementList;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ currentOffset ]);

    return (
        <nav className="w-full flex justify-center items-center">
            <ol className="flex gap-2 items-center">
                { PaginationElements() }
            </ol>
        </nav>
    )
}