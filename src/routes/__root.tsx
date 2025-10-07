import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { NavbarRoot } from '@/components/navbar';

const RootLayout = () => (
  <>
    <NavbarRoot />

    <Outlet />
    
    <TanStackRouterDevtools />
  </>
)

export const Route = createRootRoute({ component: RootLayout })