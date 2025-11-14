import z from "zod";
import { useCallback, useState } from "react";
import { createFileRoute, Link } from '@tanstack/react-router';
import { createColumnHelper, useReactTable, getCoreRowModel, flexRender, type RowData } from '@tanstack/react-table';

import AuthSingleton from "@/classes/AuthSingleton";
import { cn, formatCurrency } from "@/lib/utils";
import { GetProductListPage, type TProductListPageResponse } from "@/lib/actions/productActions";

import { Checkbox } from "@/components/forms";
import Button from "@/components/button";
import { Ellipsis, Plus as PlusIcon, ChevronsLeft, ChevronsRight } from "lucide-react";
import ErrorComponent from "@/components/common/ErrorComponent";

declare module '@tanstack/react-table' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface ColumnMeta<TData extends RowData, TValue> {
        size?: string
    }
}

const ProductSearchSchema = z.object({
    offset: z.int().optional(),
}).optional();

export const Route = createFileRoute('/app/user/products/')({
    component: RouteComponent,
    errorComponent: ErrorComponent,
    validateSearch: ProductSearchSchema,
    loaderDeps: ({ search }) => ({ offset: search?.offset }),
    loader: async ({ deps }) => {
        const userId = AuthSingleton.getUserId() as string;
        const data = await GetProductListPage({ offset: deps.offset, userId });

        if (!data.success) throw new Error(data.message);
        return data.data;
    }
})

type Flatten<T> = T extends (infer U)[] ? U : T;

const columnHelper = createColumnHelper<Flatten<TProductListPageResponse['items']>>();

const columns = [
    columnHelper.display({
        id: "select",
        meta: {size: '48px'},
        header: props => (
            <Checkbox
                checked={
                    props.table.getIsAllPageRowsSelected() ||
                    (props.table.getIsSomePageRowsSelected() && 'indeterminate')
                }
                onCheckedChange={value => props.table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: props => (
            <Checkbox
                checked={props.row.getIsSelected()}
                onCheckedChange={value => props.row.toggleSelected(!!value)}
                aria-label="Select product"
            />
        )
    }),
    columnHelper.accessor('product.name', {
        header: "Name",
        meta: {size: 'auto'},
        cell: props => {
            const val = props.getValue()
            return (
                <span
                    className="font-bold text-primary-300 w-full whitespace-nowrap truncate"
                >
                    <Link to="/item/$itemId" params={{ itemId: props.row.original.product.id ?? "" }}>{ val }</Link>
                </span>
            )
        }
    }),
    columnHelper.accessor('product.price', {
        header: "Price",
        meta: {size: '20%'},
        cell: props => {
            const amt = formatCurrency(props.getValue());

            return <span>{ amt }</span>
        }
    }),
    columnHelper.display({
        id: "actions",
        meta: {size: '48px'},
        cell: props => {
            return (
                <div>
                    <Ellipsis
                        className="size-6"
                    />
                </div>
            )
        }
    })
]

function RouteComponent() {
    const data = Route.useLoaderData();

    return (
        <div
            className="flex flex-col gap-4 bg-base-200 p-4 rounded-box"
        >
            <HeaderControls />

            { data
                ? (
                    <>
                    <ProductTable listings={data.items} />
                    <PaginationComponent />
                    </>
                )
                : (
                    <p>
                        Loading...
                    </p>
                )}
        </div>
    )
}

function PaginationComponentItem({
    value,
    currentValue
}: {
    value: number,
    currentValue: number
}) {
    return (
        <Link to="." search={prev => ({ ...prev, offset: value })} tabIndex={-1}>
            <button
                className={cn(
                    "min-w-8 px-2 py-1 text-center rounded-[4px] cursor-pointer outline-none ring-base-500 focus:ring-2 hover:ring-2 transition-all shadow-xs border",
                    currentValue === value
                        ? "bg-base-500 text-primary-content font-bold border-base-500"
                        : "bg-base-300 text-base-400 border-base-500/5"
                )}
            >
                { value }
            </button>
        </Link>
    )
}

function PaginationComponent() {
    const data = Route.useLoaderData();
    const search = Route.useSearch();

    const currentPage = (search?.offset ?? 1);
    const totalPages = 20; /*(data?.totalPages ?? 1);*/

    const MAX_VISIBLE_PAGES = 9;
    const _pageMidPoint = Math.floor(MAX_VISIBLE_PAGES / 2);

    const PaginationElements = useCallback(() => {
        const elementList: React.ReactElement[] = [];
        const lowestPage = Math.min(Math.max(currentPage - _pageMidPoint, 1), totalPages - MAX_VISIBLE_PAGES + 1);
        const highestPage = Math.max(Math.min(totalPages, currentPage + _pageMidPoint), MAX_VISIBLE_PAGES);

        for (let i = lowestPage; i <= highestPage; i++) {
            if (i == lowestPage && i > 1) {
                elementList.push((
                    <Link to="." search={prev => ({ ...prev, offset: undefined })} tabIndex={-1}>
                        <ElementSeparator>
                            <ChevronsLeft />
                        </ElementSeparator>
                    </Link>
                ));
            }

            elementList.push(<PaginationComponentItem value={i} currentValue={currentPage} key={i} />);
            
            if (i == highestPage && i < totalPages) {
                elementList.push((
                    <Link to="." search={prev => ({ ...prev, offset: totalPages })} tabIndex={-1}>
                        <ElementSeparator>
                            <ChevronsRight />
                        </ElementSeparator>
                    </Link>
                ));
            }
        }

        return elementList;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, totalPages]);

    const ElementSeparator = ({ children }: { children?: React.ReactNode}) => (<button className="flex [&>svg]:size-6 cursor-pointer text-base-400 hover:text-base-500 transition-colors">{ children }</button>);

    return (
        <div className="flex gap-2 w-full items-center justify-center">
            { PaginationElements() }
        </div>
    )
}

function ProductTable({ listings } : { listings: TProductListPageResponse['items'] }) {
    const data = listings;
    const [ rowSelection, setRowSelection ] = useState({});
    const table = useReactTable({
        columns,
        data,
        getCoreRowModel: getCoreRowModel(),
        onRowSelectionChange: setRowSelection,
        state: {
            rowSelection
        },
    });

    return (
        <table className="tbl">
            <thead>
                { table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                        { headerGroup.headers.map(header => (
                            <th key={header.id} colSpan={header.colSpan} style={{ width: header.column.columnDef.meta?.size || "auto" }}>
                                { header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext()) }
                            </th>
                        )) }
                    </tr>
                )) }
            </thead>
            
            <tbody>
                { table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                        <tr key={row.id}>
                            { row.getVisibleCells().map((cell) => (
                                <td key={cell.id} >
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                    )}
                                </td>
                            )) }
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={columns.length}>
                            No products found.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    )
}

function HeaderControls() {
    return (
        <div
            className="flex items-center gap-2 w-full"
        >
            <DebouncedSearchBar />

            <Button asChild>
                <Link to="/app/user/products/new">
                    <PlusIcon /> New listing
                </Link>
            </Button>
        </div>
    )
}

function DebouncedSearchBar() {
    return (
        <input
            className="rounded-field h-9 px-3 py-1 bg-base-100 placeholder:text-base-300 outline-none focus:ring-base-500 focus:ring-2 grow-1 shrink-1"
            placeholder="Search..."
        />
    )
}
