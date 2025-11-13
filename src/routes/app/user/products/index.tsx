import z from "zod";
import { useEffect, useState, useTransition } from "react";
import { createFileRoute, Link } from '@tanstack/react-router';
import { createColumnHelper, useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';

import AuthSingleton from "@/classes/AuthSingleton";
import { formatCurrency } from "@/lib/utils";
import { GetProductListPage, FetchProductListSchema, type TProductListPageResponse } from "@/lib/actions/productActions";
import type { TProductListItem } from "@/models";

import { Checkbox } from "@/components/forms";
import Button from "@/components/button";
import { Ellipsis, Plus as PlusIcon } from "lucide-react";

const ProductSearchSchema = z.object({
    offset: z.int().optional(),
}).optional();

export const Route = createFileRoute('/app/user/products/')({
    component: RouteComponent,
    validateSearch: ProductSearchSchema,
})

const columnHelper = createColumnHelper<TProductListItem>();

const columns = [
    columnHelper.display({
        id: "select",
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
    columnHelper.accessor('name', {
        header: "Name",
        cell: props => props.getValue()
    }),
    columnHelper.accessor('price', {
        header: "Price",
        cell: props => {
            const amt = formatCurrency(props.getValue());

            return <span>{ amt }</span>
        }
    }),
    columnHelper.display({
        id: "actions",
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
    const search = Route.useSearch();
    const [ loadedData, setLoadedData ] = useState<TProductListPageResponse[] | null>(null);
    const [ isDataReady, setIsDataReady ] = useState<boolean>(false);

    useEffect(() => {
        const fetchData = async () => {
            const data = await GetProductListPage({ offset: search?.offset });
        }
    }, [search]);

    return (
        <div
            className="flex flex-col gap-4 bg-base-200 p-4 rounded-box"
        >
            <HeaderControls />

            {/* { productList && <ProductTable listings={productList} /> } */}
        </div>
    )
}

function ProductTable({ listings } : { listings: TProductListItem[] }) {
    const data = listings;
    const [ rowSelection, setRowSelection ] = useState({});
    const table = useReactTable({
        columns,
        data,
        getCoreRowModel: getCoreRowModel(),
        onRowSelectionChange: setRowSelection,
        state: {
            rowSelection
        }
    });

    return (
        <table className="tbl">
            <thead>
                { table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                        { headerGroup.headers.map(header => (
                            <th key={header.id} colSpan={header.colSpan}>
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
