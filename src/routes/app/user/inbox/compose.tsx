import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/user/inbox/compose')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/app/user/inbox/compose"!</div>
}
