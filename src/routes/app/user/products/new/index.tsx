import { useTransition, useState } from "react";
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";

import { AddProductAction } from "@/lib/actions/productActions";
import { NewProductSchema } from "@/models/schemas";

import { Input, TextArea, FieldSet, FileUploadInput } from "@/components/forms";
import Button from "@/components/button";

import CategorySelector from "@/components/common/CategorySelector";
import GlobalConfig from "@/lib/globalConfig";

export const Route = createFileRoute('/app/user/products/new/')({
	component: RouteComponent,
})

function RouteComponent() {
	// TODO: maybe extract this transition + error message into a custom hook
	// Update: useServerAction() custom hook is available, change this into that
	const [ isPending, startTransition ] = useTransition();
	const [ formError, setFormError ] = useState<string | null>(null);
	const navigate = useNavigate();

	const formMethods = useForm<z.input<typeof NewProductSchema>, any, z.output<typeof NewProductSchema>>({
		resolver: zodResolver(NewProductSchema)
	});
	const { handleSubmit } = formMethods;

	const onSubmit = (data: z.output<typeof NewProductSchema>) => {
		if (isPending) return;

		startTransition(async () => {
			const res = await AddProductAction({
				name: data.name,
				price: data.price,
				description: data.description,
				categories: data.categories,
				files: data.files
			});

			if (res.success) {
				if (res.data) {
					navigate({ to: `/item/${res.data}` });
				}
			} else {
				setFormError(res.message || "Unknown error occurred.");
			}
		});
	}

	return (
		<div
			className="flex flex-col p-4 gap-4 rounded-box bg-base-200"
		>
			<h1 className="text-lg font-bold">
				New product listing
			</h1>

			{ formError && (
				<p className="text-destructive-content">
					{formError}
				</p>
			)}

			<FormProvider {...formMethods}>
				<form onSubmit={handleSubmit(onSubmit as any)}>
					<div className="flex flex-col gap-4">
						<FieldSet
							name="name"
							label="Product name"
							errorAlignment="horizontal"
							as={Input}
						/>

						<FieldSet
							name="price"
							label="Price"
							errorAlignment="horizontal"
							type="number"
							step={0.01}
							as={Input}
						/>

						<FieldSet
							name="description"
							label="Description"
							errorAlignment="horizontal"
							rows={8}
							as={TextArea}
						/>

						<FieldSet
							name="categories"
							label="Categories"
							errorAlignment="horizontal"
							as={CategorySelector}
						/>

						<FieldSet
							name="files"
							label={`Product photos (up to ${GlobalConfig.MaxImagesPerListing} files)`}
							errorAlignment="horizontal"
							as={FileUploadInput}
						/>

						<Button
							type="submit"
							disabled={isPending}
						>
							Submit
						</Button>
					</div>
				</form>
			</FormProvider>
		</div>
	)
}
