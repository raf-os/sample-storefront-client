import { createRootRouteWithContext, HeadContent, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { AuthWrapper } from "@/authWrapper";
import { NavbarRoot } from '@/components/navbar';

import type { TAuthData } from "@/authContext";
import { AuthRefresh } from "@/lib/actions/authAction";
import AuthSingleton from "@/classes/AuthSingleton";
import TokenRefreshHandler from "@/handlers/TokenRefreshHandler";

import { TooltipProvider } from "@radix-ui/react-tooltip";

interface IRootRouteContext {
	authData: TAuthData | null,
	authPromise: Promise<void>
}

const RootLayout = () => (
	<TooltipProvider>
		<HeadContent />
		<AuthWrapper>
			<div className='relative flex flex-col min-h-dvh z-0'>
				<NavbarRoot />
				
				<div className="flex flex-col grow-1 shrink-1">
					<Outlet />
				</div>
				
				<TanStackRouterDevtools />
			</div>
		</AuthWrapper>
	</TooltipProvider>
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
	beforeLoad: ({ context }) => {
		const promise = AuthRefresh().then((token) => {
			if (token) {
				AuthSingleton.updateToken(token);
				TokenRefreshHandler.updateExpireDate(token.exp * 1000);
			}
		});
		context.authPromise = promise;
		return;
	}
})