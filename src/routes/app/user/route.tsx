import { createFileRoute, Navigate, Outlet, Link, type ValidateToPath } from '@tanstack/react-router';
import TokenRefreshHandler from "@/handlers/TokenRefreshHandler";

import { useAuth } from "@/hooks";
import { composeTitle } from "@/lib/utils";

import PageSetup from "@/components/layout/PageSetup";

export const Route = createFileRoute('/app/user')({
	component: RouteComponent,
	loader: async () => {
		const isValid = await TokenRefreshHandler.validateToken();
		return {
			authorized: isValid
		}
	},
	head: () => ({
		meta: [
			{
				title: composeTitle('User Panel')
			}
		]
	})
});

function RouteComponent() {
	const data = Route.useLoaderData();
	if (!data.authorized) return <Navigate to="/unauthorized" />

	return (
		<>
			<PageSetup
				mainContent={MainContent}
			/>
		</>
	)
}

function MainContent() {
	return (
		<div className="flex gap-4 relative">
			<div className="flex flex-col w-[240px] grow-0 shrink-0">
				<SubSideBar />
			</div>

			<div className="flex flex-col grow-1 shrink-1">
				<Outlet />
			</div>
		</div>
	)
}

type TMenuItem = {
	href?: ValidateToPath,
	label: string
}

type TMenu = {
	[key: string]: TMenuItem[]
}

const Menu: TMenu = {
	"User panel": [
		{
			href: "/app/user",
			label: "Account settings"
		}, {
			label: "My products"
		}
	]
}

function SubSideBar() {
	const MenuMapping = Object.entries(Menu).map(([k, v]) => (
			<MenuHeader label={k} items={v} />
		));

	return (
		<>
			{ ...MenuMapping }
		</>
	);
}

function MenuHeader({ label, items }: { label: string, items: TMenuItem[] }) {
	const ItemsMapping = items.map(item => <MenuItem {...item} />);

	return (
		<ul>
			<h1 className="text-lg font-bold text-primary-400">
				{ label }
			</h1>

			<>
				{ ...ItemsMapping }
			</>
		</ul>
	)
}

function MenuItem(props: TMenuItem) {
	return (
		<li className="text-base-400">
			{ props.href
				? (
					<Link
						to={props.href}
						activeProps={{ className: "text-base-500 font-bold" }}
					>
						{ props.label }
					</Link>
				)
				: props.label }
		</li>
	)
}