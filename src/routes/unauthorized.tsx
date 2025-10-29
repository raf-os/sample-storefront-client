import { createFileRoute } from '@tanstack/react-router';

import PageSetup from "@/components/layout/PageSetup";

export const Route = createFileRoute('/unauthorized')({
	component: RouteComponent,
})

function RouteComponent() {
	return <PageSetup mainContent={UnauthorizedPage} />
}

function UnauthorizedPage() {
	return (
		<div>
			You're not authorized to view this page.
		</div>
	)
}
