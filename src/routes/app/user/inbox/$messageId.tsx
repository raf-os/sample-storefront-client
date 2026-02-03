import SectionCard from '@/components/common/SectionCard';
import { GetUserInboxMessage } from '@/lib/actions/userAction'
import { QueryKeys } from '@/lib/queryKeys';
import { queryClient } from '@/lib/serverRequest';
import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect } from 'react';
import RenderUsername from '@/components/common/RenderUsername';
import Separator from '@/components/common/Separator';
import { ArrowLeft, MessageSquareReply, Trash2Icon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';

export const Route = createFileRoute('/app/user/inbox/$messageId')({
  loader: async ({ params }) => {
    const data = await GetUserInboxMessage(params.messageId);
    return data;
  },
  component: RouteComponent,
})

function RouteComponent() {
  const data = Route.useLoaderData();

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: QueryKeys.User.InboxPreviewSize });
    queryClient.invalidateQueries({ queryKey: QueryKeys.User.InboxPreview });
  });

  return (
    <div className="flex flex-col gap-4">
      <SectionCard
      >
        <div
          className="mb-4 flex gap-2"
        >
          <MailControl asChild>
            <Link to="/app/user/inbox">
              <ArrowLeft />
              <span className="sr-only">Back to inbox</span>
            </Link>
          </MailControl>

          <MailControl>
            <MessageSquareReply />
            <span className="sr-only">Reply to message</span>
          </MailControl>

          <MailControl>
            <Trash2Icon />
            <span className="sr-only">Delete message</span>
          </MailControl>
        </div>
        <h1
          className="text-lg font-bold"
        >
          {data?.title}
        </h1>
        <RenderUsername userId={data.senderId as string} userName={data.sender?.name as string} userRole={data.sender?.role as number} />

        <Separator />

        <div>
          {data?.content}
        </div>
      </SectionCard>
    </div>
  )
}

function MailControl({
  className,
  children,
  asChild,
  ...rest
}: React.ComponentPropsWithRef<'button'> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(
        "rounded-full size-9 flex items-center justify-center hover:bg-base-100 cursor-pointer p-2 transition-colors",
        "[&_svg]:size-6",
        className
      )}
      {...rest}
    >
      {children}
    </Comp>
  )
}
