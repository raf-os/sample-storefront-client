import { z } from "zod";
import { createFileRoute, Link } from '@tanstack/react-router';
import { GetUserInboxPage, GetUserInboxSize } from '@/lib/actions/userAction';
import type { paths } from "@/api/schema";
import type { Flatten } from "@/types/utilities";
import { keepPreviousData, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { QueryKeys } from "@/lib/queryKeys";
import { buildQueryKey, queryClient } from "@/lib/serverRequest";
import SectionCard from "@/components/common/SectionCard";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Checkbox } from "@/components/forms";
import ErrorComponent from "@/components/common/ErrorComponent";
import PaginationComponent from "@/components/common/PaginationComponent";
import { useEffect, useState } from "react";

const mailSearchSchema = z.object({
  offset: z.int().min(1).optional()
});

type TMailItem = Required<Flatten<paths['/api/Mail/inbox']['get']['responses']['200']['content']['application/json']>>;

type TMailList = TMailItem[];

export const Route = createFileRoute('/app/user/inbox/')({
  component: RouteComponent,
  validateSearch: mailSearchSchema,
});

function useInboxSize() {
  return useSuspenseQuery({
    queryKey: QueryKeys.User.InboxSize,
    queryFn: async () => {
      const d = await GetUserInboxSize({ unreadOnly: false });
      return d;
    }
  }, queryClient);
}

const columnHelper = createColumnHelper<TMailItem>();

const rtf = new Intl.RelativeTimeFormat("en", {
  localeMatcher: "best fit",
  numeric: "auto",
  style: "long"
});

const units = [
  { unit: "year", seconds: 60 * 60 * 24 * 365 },
  { unit: "month", seconds: 60 * 60 * 24 * 30 },
  { unit: "week", seconds: 60 * 60 * 24 * 7 },
  { unit: "day", seconds: 60 * 60 * 24 },
  { unit: "hour", seconds: 60 * 60 },
  { unit: "minute", seconds: 60 },
  { unit: "second", seconds: 1 },
];

const timeUnits = {
  second: 1,
  minute: 60,
  hour: 60 * 60,
  day: 60 * 60 * 24,
  month: 60 * 60 * 24 * 30,
}

const formatRelativeDate = (reference: string) => {
  const oldDate = new Date(reference + "Z").getTime(); // HACK: Adds the UTC+0 indicator at the end
  const nowDate = Date.now();
  const diff = nowDate - oldDate;
  const timeInSeconds = Math.round(diff / 1000);

  if (timeInSeconds >= timeUnits.month) {
    return new Intl.DateTimeFormat().format(oldDate);
  }

  let unit = "day";
  let value = timeUnits.day;

  if (timeInSeconds < timeUnits.day) {
    for (const [u, v] of Object.entries(timeUnits).slice(0, 3)) {
      unit = u;
      value = v;
      if (v >= timeInSeconds) break;
    }
  }

  return rtf.format(- Math.round(timeInSeconds / (value as number)), unit as any);
}

const tableColumns = [
  columnHelper.display({
    id: 'selection',
    meta: { size: '48px' },
    cell: props => (
      <Checkbox
        checked={props.row.getIsSelected()}
        onCheckedChange={value => props.row.toggleSelected(!!value)}
        aria-label="Select message"
      />
    ),
    header: props => (
      <Checkbox
        checked={
          props.table.getIsAllPageRowsSelected() ||
          (props.table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={value => props.table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    )
  }),
  columnHelper.accessor('title', {
    meta: { size: 'auto' },
    header: props => (
      <h1>
        Title
      </h1>
    ),
    cell: info => (
      <Link
        to="/app/user/inbox/$messageId"
        params={{ messageId: info.row.original.id ?? "" }}
        className="text-primary-300 font-medium hover:text-primary-200 flex w-full"
      >
        {info.getValue()}
      </Link>
    ),
  }),
  columnHelper.accessor('senderName', {
    meta: { size: '20%' },
    header: props => <h1>From</h1>,
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('sendDate', {
    meta: { size: '20%' },
    header: props => <h1>Date</h1>,
    cell: info => formatRelativeDate(info.getValue()),
  }),
  columnHelper.display({
    id: 'action',
    meta: { size: '48px' },
    cell: props => <p>[ ]</p>
  }),
];

function RouteComponent() {
  const refetchInterval = 1000 * 60; // 1 minute
  const search = Route.useSearch();

  const { data, isPending, isError, error } = useQuery({
    queryKey: buildQueryKey("get", "/api/Mail/inbox", { query: { offset: search.offset } }),
    queryFn: async () => {
      const data = await GetUserInboxPage({ offset: search.offset });
      queryClient.invalidateQueries({ queryKey: QueryKeys.User.InboxPreview });
      return data as TMailList;
    },
    placeholderData: keepPreviousData,
    staleTime: refetchInterval,
    refetchInterval: refetchInterval,
  }, queryClient);

  return (
    <div>
      {
        (isPending && data === undefined)
          ? (
            <SectionCard>
              Loading...
            </SectionCard>
          ) : isError
            ? (
              <div
                className="bg-error text-error-content border border-error-content/25 px-3 py-2 rounded-box"
              >
                <ErrorComponent errorMessage={error.message} />
              </div>
            ) : data
            && <InboxComponent data={data} />
      }
    </div>
  )
}

function InboxComponent({
  data
}: {
  data: TMailList
}) {
  const table = useReactTable({ columns: tableColumns, data: data, getCoreRowModel: getCoreRowModel() });
  const search = Route.useSearch();
  const { data: inboxSize } = useInboxSize();
  const totalPages = Math.ceil(inboxSize / 10);
  return (
    <>
      <h1 className="text-lg font-bold pl-2 mb-1">
        Your inbox
      </h1>
      <SectionCard>
        {data.length > 0 ? (
          <>
            <table className="tbl">
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id} style={{ width: header.column.columnDef.meta?.size ?? "auto" }}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>

              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr
                    key={row.id}
                    className="group"
                  >
                    {row.getVisibleCells().map(cell => (
                      <td
                        key={cell.id}
                        className="truncate"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <p className="text-base-500/75">
            Your inbox is currently empty.
          </p>
        )}

        {data.length > 0 && (
          <div className="mt-4">
            <PaginationComponent
              currentOffset={search.offset}
              totalPages={totalPages}
            >
              <PaginationComponent.Label />
            </PaginationComponent>
          </div>
        )}
      </SectionCard>
    </>
  )
}

function MailItem({
  data
}: {
  data: TMailItem
}) {
  return (
    <div></div>
  )
}
