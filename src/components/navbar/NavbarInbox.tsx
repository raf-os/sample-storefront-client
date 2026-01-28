import * as Popover from "@radix-ui/react-popover";
import { useState } from "react";
import { cn, PreventLayoutFlash } from "@/lib/utils";
import { GetUserInboxPreview } from "@/lib/actions/userAction";
import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "@/lib/queryKeys";
import { queryClient, ServerImagePath } from "@/lib/serverRequest";
import type { paths } from "@/api/schema";
import type { Flatten } from "@/types/utilities";
import Button from "../button";
import ImagePromise from "../common/ImagePromise";
import { Link } from "@tanstack/react-router";

type TInboxItemPreview = Required<Flatten<paths['/api/Mail/inbox/preview']['get']['responses']['200']['content']['application/json']>>;

export default function NavbarInbox({
  children,
  inboxSize,
  ...rest
}: React.ComponentPropsWithRef<typeof Popover.Trigger> & { inboxSize: number }) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { data: inboxItems, isPending, isError, isSuccess } = useQuery({
    queryKey: QueryKeys.User.InboxPreview,
    queryFn: async () => {
      const d = await PreventLayoutFlash(GetUserInboxPreview());
      return d;
    },
    enabled: isOpen === true,
  }, queryClient);

  const handlePopoverClose = () => {
    setIsOpen(false);
  }

  const inboxOverflow = Math.max(inboxSize - 5, 0);

  return (
    <Popover.Root
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <Popover.Trigger {...rest}>
        {children}
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          onOpenAutoFocus={e => e.preventDefault()}
          sideOffset={6}
          className={
            "flex flex-col w-128 overflow-clip gap-2 bg-base-200 " +
            "border border-base-300 shadow-xs rounded-box p-1 " +
            "data-[state=open]:animate-slideUpAndFade"
          }
        >
          {isPending
            ? (
              <div>
                Loading...
              </div>
            ) : (
              isError
                ? (
                  <div>
                    Error fetching data.
                  </div>
                ) : (
                  isSuccess && (
                    <div className="flex flex-col gap-2 p-1">
                      {inboxItems?.map((item) => (
                        <NavbarInboxItem
                          data={item as TInboxItemPreview}
                          key={item.id}
                          popoverCloseFn={handlePopoverClose}
                        />
                      ))}

                      {(inboxItems && inboxItems.length == 0) && (
                        <span className="text-sm opacity-75">
                          No unread mail.
                        </span>
                      )}

                      {inboxOverflow > 0 && (
                        <p className="text-sm text-base-500/75 text-center">
                          {inboxOverflow} more items unread.
                        </p>
                      )}

                    </div>
                  )
                )
            )}

          <Link
            to="/app/user/inbox"
            className="btn btn-primary rounded-box-inner"
            onClick={handlePopoverClose}
          >
            Go to inbox
          </Link>

          <Popover.Arrow
            className="fill-base-500"
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

function NavbarInboxItem({
  data,
  popoverCloseFn
}: {
  data: TInboxItemPreview,
  popoverCloseFn: () => void,
}) {
  const mailTitle = data.title ?? "Untitled";
  const mailSender = data.senderName;
  const mailSenderId = data.senderId;
  const mailSenderAvatarUrl = data.senderAvatarUrl;

  return (
    <div
      className="flex gap-2 items-center group cursor-pointer"
    >
      <div className="size-6 grow-0 shrink-0 overflow-hidden rounded-full ring-2 ring-base-500">
        <ImagePromise
          src={mailSenderAvatarUrl ? ServerImagePath("/files/avatar/{FileName}", { path: { FileName: mailSenderAvatarUrl } }) : null}
          fallback={<img src="/images/default-avatar.webp" alt="Default user avatar" />}
          loadingComponent={<div className="size-full shimmer" />}
          alt="User avatar"
        />
      </div>

      <div className={cn(
        "flex px-2 py-1 items-center gap-2 grow-1 shrink-1 bg-base-100 rounded-box shadow-xs overflow-hidden",
        "group-hover:bg-primary-500 group-focus:bg-primary-500"
      )}>
        <h1 className="grow-0 shrink-0 w-32 text-sm font-bold select-none truncate border-r border-r-base-500/30 pr-1">
          {mailSender}
        </h1>
        <h2 className="italic grow-1 shrink-1 truncate text-base-500/75">
          "{mailTitle}"
        </h2>
      </div>
    </div>
  )
}
