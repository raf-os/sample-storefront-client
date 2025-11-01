import { createFileRoute, Navigate, Outlet, Link, useMatchRoute, type ValidateToPath } from '@tanstack/react-router';
import TokenRefreshHandler from "@/handlers/TokenRefreshHandler";

import { composeTitle, cn } from "@/lib/utils";

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
	exactPath?: boolean,
	label: string,
	children?: TMenuItem[]
}

type TMenu = {
	[key: string]: TMenuItem[]
}

const Menu: TMenu = {
	"User panel": [
		{
			href: "/app/user",
			exactPath: true,
			label: "Account settings"
		}, {
			href: "/app/user/products",
			label: "My products",
			children: [
				{
					href: "/app/user/products/new",
					label: "New product"
				}
			]
		}
	]
}

function SubSideBar() {
	const MenuMapping = Object.entries(Menu).map(([k, v]) => (
			<MenuHeader label={k} items={v} />
		))

	return (
		<>
			{ ...MenuMapping }
		</>
	)
}

function MenuHeader({ label, items }: { label: string, items: TMenuItem[] }) {
	const ItemsMapping = items.map(item => <MenuItem props={item} />);

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

type MenuItemProps = {
	props: TMenuItem,
	depth?: number,
}

function MenuItem({props, depth = 0}: MenuItemProps) {
	const matchRoute = useMatchRoute();

	return (
		<li className="text-base-400">
			{ props.href
				? (
					<Link
						to={props.href}
						activeOptions={{ exact: props.exactPath || false }}
						activeProps={{ className: cn( depth===0 ? "text-base-500 font-bold" : "text-base-500 font-medium") }}
					>
						{ props.label }
					</Link>
				)
				: props.label }
			
			{ (props.children !== undefined && matchRoute({ to: props.href, fuzzy: true, includeSearch: true })) && (
				<ul style={{ paddingLeft: (depth + 1) * 16 }}>
					{ props.children.map((child) => (
						<MenuItem props={child} depth={depth + 1} key={child.label} />
					)) }
				</ul>
			)}
		</li>
	)
}