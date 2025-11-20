import { useEffect, useState } from "react";
import { z } from "zod";
import { createFileRoute } from '@tanstack/react-router';
import { useForm, FormProvider } from "react-hook-form";

import { useServerAction } from "@/hooks";

import { GetProductById } from "@/lib/actions/productActions";
import type { TProduct } from "@/models";

export const Route = createFileRoute('/app/user/products/edit/$itemId')({
	component: RouteComponent,
})

function RouteComponent() {
	return <ItemEditPage />
}

const ProductPatchSchema = z.object({
	name: z
		.string()
		.min(4, "Name must have at least 4 characters.")
		.max(100, "Name must be at most 100 characters long."),
	price: z
		.number("Price must be a number.")
		.positive("Price can't be negative."),
	description: z
		.string()
		.optional(),
	categories: z
		.set(z.number("Invalid category types."))
		.optional()
});

function ItemEditPage() {
	const [ productData, setProductData ] = useState<TProduct | null>(null);
	const [ isPending, startTransition, errorMessage ] = useServerAction();

	const methods = useForm<z.infer<typeof ProductPatchSchema>>();

	const isRequestReady = productData !== null || errorMessage !== null;

	const routeParams = Route.useParams();

	useEffect(() => {
		startTransition(async () => {
			const data = await GetProductById(routeParams.itemId);

			if (!data.success) throw new Error(data.message);

			setProductData(data.data ?? null);
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [routeParams]);

	return (
		<div>
			<div className="flex gap-2 mb-2">
				<h1 className="font-bold text-xl">
					Editing {` `}
					{ !isRequestReady && (
						<span className="sr-only">(loading product data...)</span>
					)}

					{ (isRequestReady && !errorMessage) && (
						<span className="italic">
							"{ productData?.name }"
						</span>
					)}
				</h1>
				{ !isRequestReady && (
					<div className="bg-base-400 w-48 rounded-[4px] shimmer" />
				)}
			</div>

			<div
				className="bg-base-200 rounded-box p-4"
			>
				<FormProvider {...methods}>
					<form>
						form
					</form>
				</FormProvider>
			</div>
		</div>
	)
}
