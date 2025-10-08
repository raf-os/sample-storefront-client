import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { NavbarRoot } from '@/components/navbar';

const RootLayout = () => (
	<div className='flex flex-col min-h-dvh'>
		<NavbarRoot />
		
		<div className="flex flex-col grow-1 shrink-1">
			<Outlet />
		</div>
		
		<TanStackRouterDevtools />
	</div>
)

export const Route = createRootRoute({ component: RootLayout })