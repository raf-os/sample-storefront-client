import { useState } from "react";
import { createFileRoute, Link } from '@tanstack/react-router';
import { createColumnHelper, useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { z } from "zod";

import { formatCurrency } from "@/lib/utils";

import { Checkbox } from "@/components/forms";
import Button from "@/components/button";
import { Ellipsis, Plus as PlusIcon } from "lucide-react";

const RouteSearchParamsSchema = z.object({
    page: z.number().catch(1),
    sort: z.enum(['newest', 'oldest']).catch('newest'),
});

type ProductSearch = z.infer<typeof RouteSearchParamsSchema>;

export const Route = createFileRoute('/app/user/products/')({
    component: RouteComponent,
    validateSearch: (search) => RouteSearchParamsSchema.parse(search),
})

type TProductItem = {
    id: string,
    name: string,
    price: number
}

const columnHelper = createColumnHelper<TProductItem>();

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

const FakeProductList: TProductItem[] = [
    {
        id: '1',
        name: 'Fentanyl',
        price: 29.99
    }, {
        id: '2',
        name: 'The Real Slim Shady (real)',
        price: 14.49
    }
]

function RouteComponent() {
    return (
        <div
            className="flex flex-col gap-4 bg-base-200 p-4 rounded-box"
        >
            <HeaderControls />

            <ProductTable listings={FakeProductList} />
        </div>
    )
}

function ProductTable({ listings } : { listings: TProductItem[] }) {
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
