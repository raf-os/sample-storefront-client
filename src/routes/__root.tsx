import { createRootRouteWithContext, HeadContent, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { AuthWrapper } from "@/authWrapper";
import { NavbarRoot } from '@/components/navbar';

import type { TAuthData } from "@/authContext";
import { AuthRefresh } from "@/lib/actions/authAction";
import AuthSingleton from "@/classes/AuthSingleton";
import TokenRefreshHandler from "@/handlers/TokenRefreshHandler";

interface IRootRouteContext {
	authData: TAuthData | null
}

const RootLayout = () => (
	<>
		<HeadContent />
		<AuthWrapper>
			<div className='flex flex-col min-h-dvh'>
				<NavbarRoot />
				
				<div className="flex flex-col grow-1 shrink-1">
					<Outlet />
				</div>
				
				<TanStackRouterDevtools />
			</div>
		</AuthWrapper>
	</>
)

export const Route = createRootRouteWithContext<IRootRouteContext>()({
	component: RootLayout,
	head: () => ({
		meta: [
			{
				title: "Storefront Sample"
			}
		],
	}),
	beforeLoad: async () => {
		const token = await AuthRefresh();
		if (token) {
			AuthSingleton.updateToken(token);
			TokenRefreshHandler.updateExpireDate(token.exp * 1000);
		}
	}
})