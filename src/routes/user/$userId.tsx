import { createFileRoute } from '@tanstack/react-router';
import { useServerAction } from "@/hooks";
import PageSetup from "@/components/layout/PageSetup";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

import { GetUserPageById } from "@/lib/actions/userAction";

import type { paths } from "@/api/schema";

export const Route = createFileRoute('/user/$userId')({
	component: RouteComponent,
})

function RouteComponent() {
	return <PageSetup mainContent={MainContent} />
}

type UserDataAlias = paths['/User/{Id}']['get']['responses']['200']['content']['application/json'];

function MainContent() {
	const { userId } = Route.useParams();
	const [ loadedData, setLoadedData ] = useState<UserDataAlias | null>(null);
	const [ isPending, startTransition, errorMessage ] = useServerAction();

	useEffect(() => {
		startTransition(async () => {
			const data = await GetUserPageById(userId);
			
			setLoadedData(data);
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userId]);
	
	return (
		<div className="flex flex-col">
			<div className="flex gap-2">
				<LayoutBlock>
					test2
				</LayoutBlock>

				<LayoutBlock
					className="w-96 grow-0 shrink-0"
				>
					<p>User:</p>
					{ loadedData && loadedData.name }
				</LayoutBlock>
			</div>
		</div>
	)
}

function LayoutBlock({ children, className, ...rest }: React.ComponentPropsWithRef<'div'>) {
	return (
		<div
			className={cn(
				"grow-1 shrink-1 bg-base-200 border border-base-300/75 shadow-xs text-base-500 rounded-box px-4 py-3",
				className
			)}
			{...rest}
		>
			{ children }
		</div>
	)
}
