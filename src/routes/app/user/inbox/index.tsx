import { z } from "zod";
import { createFileRoute, Link } from '@tanstack/react-router';
import { useServerAction } from "@/hooks";
import { GetUserInboxPage, GetUserInboxSize } from '@/lib/actions/userAction';
import type { paths } from "@/api/schema";
import type { Flatten } from "@/types/utilities";
import { useEffect, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { QueryKeys } from "@/lib/queryKeys";
import { queryClient } from "@/lib/serverRequest";
import { cn, PreventLayoutFlash } from "@/lib/utils";
import SectionCard from "@/components/common/SectionCard";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Checkbox } from "@/components/forms";

const mailSearchSchema = z.object({
  page: z.int().min(1).optional()
});

type TMailItem = Required<Flatten<paths['/api/Mail/inbox']['get']['responses']['200']['content']['application/json']>>;

type TMailList = TMailItem[];

export const Route = createFileRoute('/app/user/inbox/')({
  component: RouteComponent,
  validateSearch: mailSearchSchema
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
  const [loadedData, setLoadedData] = useState<TMailList | null>(null);
  const [isPending, startTransition, errorMessage] = useServerAction();
  const search = Route.useSearch();
  const { data: inboxSize } = useInboxSize();

  useEffect(() => {
    startTransition(async () => {
      const data = await PreventLayoutFlash(GetUserInboxPage({ offset: search.page })) as any; // TODO: Try to somehow correctly type this

      setLoadedData(data);
    })
  }, [search.page]);

  // if (loadedData !== null && inboxSize < 1) {
  //   return (
  //     <SectionCard>
  //       <p>
  //         Your inbox is empty.
  //       </p>
  //     </SectionCard>
  //   )
  // }

  return (
    <div>
      {
        (isPending && loadedData == null)
          ? (
            <SectionCard>
              Loading...
            </SectionCard>
          ) : errorMessage
            ? (
              <div
                className="bg-error text-error-content border border-error-content/25 px-3 py-2 rounded-box"
              >
                <h1 className="font-bold">
                  Error fetching cart:
                </h1>

                <p>
                  {errorMessage}
                </p>
              </div>
            ) : loadedData && <InboxComponent data={loadedData}></InboxComponent>
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
  return (
    <>
      <h1 className="text-lg font-bold pl-2 mb-1">
        Your inbox
      </h1>
      <SectionCard>
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
