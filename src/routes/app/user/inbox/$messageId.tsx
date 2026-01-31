import SectionCard from '@/components/common/SectionCard';
import { GetUserInboxMessage } from '@/lib/actions/userAction'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/user/inbox/$messageId')({
  loader: async ({ params }) => {
    const data = await GetUserInboxMessage(params.messageId);
    return data;
  },
  component: RouteComponent,
})

function RouteComponent() {
  const data = Route.useLoaderData();
  return (
    <SectionCard>
      <h1>{data?.title}</h1>
      <h2>by {data?.sender?.name}</h2>
      <p>{data?.content}</p>
    </SectionCard>
  )
}
