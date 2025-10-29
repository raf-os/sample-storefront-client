import { createFileRoute } from '@tanstack/react-router';
import { useAuth } from "@/hooks";

export const Route = createFileRoute('/app/user/')({
    component: RouteComponent,
})

function RouteComponent() {
    const { authData } = useAuth();

    return (
        <div>
            <p>Hello, { authData?.userName }.</p>
            <p>This is your config page.</p>
        </div>
    )
}
