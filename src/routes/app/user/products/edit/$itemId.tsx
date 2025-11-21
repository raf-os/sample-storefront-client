import { createContext, useContext, useEffect, useState } from "react";
import { z } from "zod";
import { createFileRoute } from '@tanstack/react-router';
import { useForm, FormProvider } from "react-hook-form";

import { useServerAction } from "@/hooks";

import { GetProductById } from "@/lib/actions/productActions";
import type { TProduct } from "@/models";

import { Input, FieldSet, TextArea } from "@/components/forms";
import CategorySelector from "@/components/common/CategorySelector";
import Button from "@/components/button";

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
	discount: z
		.number()
		.positive()
		.max(100)
		.optional(),
	description: z
		.string()
		.optional(),
	categories: z
		.set(z.number("Invalid category types."))
		.optional()
});

type TEditFormContext = {
	isError: boolean,
	isLoading: boolean,
	loadedData: TProduct | null
}

const EditFormContext = createContext<TEditFormContext>({
	isError: false,
	isLoading: false,
	loadedData: null
});

function ItemEditPage() {
	const [ productData, setProductData ] = useState<TProduct | null>(null);
	const [ isPending, startTransition, errorMessage ] = useServerAction();

	const methods = useForm<z.infer<typeof ProductPatchSchema>>();

	const isRequestReady = productData !== null || errorMessage !== null;

	const routeParams = Route.useParams();

	useEffect(() => {
		startTransition(async () => {
			// Manual delay for testing purposes
			// await new Promise(resolve => setTimeout(resolve, 1000));
			const data = await GetProductById(routeParams.itemId);
			// console.log(data)

			if (!data.success) throw new Error(data.message);

			setProductData(data.data ?? null);
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [routeParams]);

	const ctx: TEditFormContext = {
		isLoading: isPending,
		isError: !!errorMessage,
		loadedData: productData
	}

	return (
		<EditFormContext value={ctx}>
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
						<div className="flex flex-col gap-4">
							<AwaitedFieldSet
								as={Input}
								name="name"
								label="Product name"
								value={productData?.name}
							/>

							<AwaitedFieldSet
								as={Input}
								name="price"
								label="Product price"
								value={productData?.price}
								type="number"
							/>

							<AwaitedFieldSet
								as={Input}
								name="discount"
								label="Discount (%)"
								value={productData?.discount}
								type="number"
							/>

							<AwaitedFieldSet
								as={TextArea}
								name="description"
								label="Description"
								value={productData?.description}
								rows={8}
							/>

							<AwaitedFieldSet
								as={CategorySelector}
								name="categories"
								label="Categories"
								//value={productData?.discount}
							/>

							<Button className="btn-primary">
								Save changes
							</Button>
						</div>
					</form>
				</FormProvider>
			</div>
		</EditFormContext>
	)
}

function AwaitedFieldSet<T extends keyof z.infer<typeof ProductPatchSchema>>({
	disabled,
	name,
	value,
	...rest
}: React.ComponentPropsWithRef<typeof FieldSet> & { value?: z.output<typeof ProductPatchSchema>[T], name: T }) {
	const { isLoading, isError } = useContext(EditFormContext);
	const myVal = value;
	return (
		<FieldSet {...rest} name={name} defaultValue={myVal} disabled={ isLoading || isError || disabled } />
	);
}
