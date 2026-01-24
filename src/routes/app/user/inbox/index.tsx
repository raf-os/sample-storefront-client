import { z } from "zod";
import { createFileRoute } from '@tanstack/react-router';
import { useServerAction } from "@/hooks";
import { GetUserInboxPage, GetUserInboxSize } from '@/lib/actions/userAction';
import type { paths } from "@/api/schema";
import type { Flatten } from "@/types/utilities";
import { useEffect, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { QueryKeys } from "@/lib/queryKeys";
import { queryClient } from "@/lib/serverRequest";
import { PreventLayoutFlash } from "@/lib/utils";
import SectionCard from "@/components/common/SectionCard";

const mailSearchSchema = z.object({
  page: z.int().min(1).optional()
});

type TMailList = paths['/api/Mail/inbox']['get']['responses']['200']['content']['application/json'];

type TMailItem = Flatten<TMailList>;

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

function RouteComponent() {
  const [loadedData, setLoadedData] = useState<TMailList | null>(null);
  const [isPending, startTransition, errorMessage] = useServerAction();
  const search = Route.useSearch();
  const { data: inboxSize } = useInboxSize();

  useEffect(() => {
    startTransition(async () => {
      const data = await PreventLayoutFlash(GetUserInboxPage({ offset: search.page }));

      setLoadedData(data);
    })
  }, [search.page]);

  if (loadedData !== null && inboxSize < 1) {
    return (
      <SectionCard>
        <p>
          Your inbox is empty.
        </p>
      </SectionCard>
    )
  }

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
  return (
    <div></div>
  )
}
