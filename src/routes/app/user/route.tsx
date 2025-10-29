import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router';
import TokenRefreshHandler from "@/handlers/TokenRefreshHandler";

import { useAuth } from "@/hooks";

import PageSetup from "@/components/layout/PageSetup";

export const Route = createFileRoute('/app/user')({
	component: RouteComponent,
	loader: async () => {
		const isValid = await TokenRefreshHandler.validateToken();
		return {
			authorized: isValid
		}
	}
})

function RouteComponent() {
	const data = Route.useLoaderData();
	if (!data.authorized) return <Navigate to="/unauthorized" />

	return (
		<PageSetup
			leftSidebar={LeftSideBar}
			mainContent={MainContent}
		/>
	)
}

function LeftSideBar() {
	const { authData } = useAuth();

	return (
		<>
			<h1 className="text-lg font-bold">
				{ authData?.userName }
			</h1>
			
			<ul>
				<li>Account Options</li>
			</ul>
		</>
	)
}

function MainContent() {
	return (
		<Outlet />
	)
}