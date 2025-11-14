import z from "zod";
import { useEffect, useState } from "react";
import { createFileRoute, Link } from '@tanstack/react-router';
import { createColumnHelper, useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';

import AuthSingleton from "@/classes/AuthSingleton";
import { formatCurrency } from "@/lib/utils";
import { GetProductListPage, type TProductListPageResponse } from "@/lib/actions/productActions";

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

type Flatten<T> = T extends (infer U)[] ? U : T;

const columnHelper = createColumnHelper<Flatten<TProductListPageResponse['items']>>();

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
    columnHelper.accessor('product.name', {
        header: "Name",
        cell: props => {
            const val = props.getValue()
            return (
                <span>
                    <Link to="/item/$itemId" params={{ itemId: props.row.original.product.id ?? "" }}>{ val }</Link>
                </span>
            )
        }
    }),
    columnHelper.accessor('product.price', {
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
    const [ loadedData, setLoadedData ] = useState<TProductListPageResponse | null>(null);
    const [ isDataReady, setIsDataReady ] = useState<boolean>(false);
    const [ fetchError, setFetchError ] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const data = await GetProductListPage({ offset: search?.offset });
            setIsDataReady(true);

            if (data.success === false) {
                setFetchError(data.message ?? "Unknown error fetching resources.");
                return;
            }

            setLoadedData(data.data ?? null);
        }

        fetchData();
    }, [search]);

    return (
        <div
            className="flex flex-col gap-4 bg-base-200 p-4 rounded-box"
        >
            <HeaderControls />

            { isDataReady
                ? fetchError
                    ? (
                        <div>
                            <p>Error fetching data:</p>
                            <p>
                                { fetchError }
                            </p>
                        </div>
                    )
                    : (
                        <>
                            { loadedData && <ProductTable listings={loadedData.items} /> }
                        </>
                    )
                : (
                    <div>
                        Loading data...
                    </div>
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
