import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { useCallback } from "react";
import {
    ChevronsLeft,
    ChevronsRight
} from "lucide-react";

type PaginationItemRenderProps = {
    selectionId: number,
    currentSelection: number,
    disabled?: boolean
}

function PaginationItemRender({
    selectionId,
    currentSelection,
    disabled
}: PaginationItemRenderProps) {
    return (
        <Link to="." search={prev => ({ ...prev, offset: selectionId })} disabled={disabled} className="group outline-none">
            <li
                className={cn(
                    "min-w-12 px-2 py-1 text-center border rounded-field shadow-xs cursor-pointer select-none transition-all outline-none group-focus:ring-3 ring-base-400",
                    currentSelection === selectionId
                        ? "font-bold bg-base-500 text-base-200 border-base-500"
                        : "text-base-400 border-base-400 bg-base-100 hover:bg-base-200",
                    disabled && "opacity-25"
                )}
            >
                { selectionId }
            </li>
        </Link>
    )
}

function PaginationItemSkip({
    children,
    to,
    disabled
}: {
    children?: React.ReactNode,
    to: number,
    disabled?: boolean
}) {

    return (
        <Link to="." search={prev => ({ ...prev, offset: to })} disabled={disabled}>
            <li className={cn(
                "[&>svg]:size-8 text-base-400 hover:text-base-500 transition-colors group-[disabled=true]:opacity-15",
                disabled && "opacity-25"
            )}
            >
                { children }
            </li>
        </Link>
    )
}

type PaginationComponentProps = {
    currentOffset?: number,
    totalPages?: number,
    disabled?: boolean,
    maxPages?: number,
    children?: React.ReactNode
}

function PaginationComponent({
    currentOffset = 1,
    totalPages = 1,
    disabled,
    maxPages = 10,
    children
}: PaginationComponentProps) {
    const _pagesMidpoint = Math.floor(maxPages / 2);
    const pages = totalPages;

    const PaginationElements = useCallback(() => {
        const elementList: React.ReactElement[]  = [];
        const lowestPage = Math.max(
            Math.min(
                currentOffset - _pagesMidpoint,
                pages - maxPages + 1
            ), 1);
        const highestPage = Math.min(
            pages,
            Math.max(
                currentOffset + _pagesMidpoint,
                maxPages
            )
        );

        for (let i = lowestPage; i <= highestPage; i++) {
            if (i === lowestPage && i> 1)
                elementList.push(<PaginationItemSkip disabled={disabled} to={1}><ChevronsLeft /></PaginationItemSkip>);

            elementList.push(<PaginationItemRender key={i} selectionId={i} currentSelection={currentOffset} />);

            if (i === highestPage && i < pages)
                elementList.push(<PaginationItemSkip disabled={disabled} to={pages}><ChevronsRight /></PaginationItemSkip>);
        }

        return elementList;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ currentOffset ]);

    return (
        <nav className="w-full flex flex-col justify-center items-center">
            { children }
            <ol className="flex gap-2 items-center">
                { PaginationElements() }
            </ol>
        </nav>
    )
}

PaginationComponent.Label = function() {
    return (
        <label
            className="text-sm font-bold text-center mb-1"
        >
            Jump to page:
        </label>
    )
}

export default PaginationComponent;