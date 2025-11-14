import z from "zod";
import { useState } from "react";
import { createFileRoute, Link } from '@tanstack/react-router';
import { createColumnHelper, useReactTable, getCoreRowModel, flexRender, type RowData } from '@tanstack/react-table';

import AuthSingleton from "@/classes/AuthSingleton";
import { formatCurrency } from "@/lib/utils";
import { GetProductListPage, type TProductListPageResponse } from "@/lib/actions/productActions";

import { Checkbox } from "@/components/forms";
import Button from "@/components/button";
import { Ellipsis, Plus as PlusIcon } from "lucide-react";
import ErrorComponent from "@/components/common/ErrorComponent";

declare module '@tanstack/react-table' {
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
                    className="font-bold text-primary-300"
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
                    <ProductTable listings={data.items} />
                )
                : (
                    <p>
                        Loading...
                    </p>
                )}
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
