import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { FileUploadAttachments } from "@/components/forms/FileUpload";

import { useServerAction } from "@/hooks";

import { GetProductById, PatchDocumentById } from "@/lib/actions/productActions";
import type { TProduct } from "@/models";
import { ProductPatchSchema } from "@/models/schemas";

import * as Tooltip from "@radix-ui/react-tooltip";
import { Input, FieldSet, TextArea, FileUploadInput } from "@/components/forms";
import CategorySelector from "@/components/common/CategorySelector";
import Button from "@/components/button";

import {
	FilePen,
	TriangleAlert as AlertIcon
} from "lucide-react";
import GlobalConfig from "@/lib/globalConfig";

export const Route = createFileRoute('/app/user/products/edit/$itemId')({
	component: RouteComponent,
})

function RouteComponent() {
	return <ItemEditPage />
}

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
	const [ fetchRequestMessages, setFetchRequestMessages ] = useState<string[] | null>(null);
	const [ isSuccess, setIsSuccess ] = useState<boolean>(false);
	const errorBox = useRef<HTMLDivElement>(null);

	const navigate = useNavigate();

	const methods = useForm<z.input<typeof ProductPatchSchema>, any, z.output<typeof ProductPatchSchema>>({
		resolver: zodResolver(ProductPatchSchema)
	});

	const { getValues, handleSubmit, reset: formReset } = methods;

	const isRequestReady = productData !== null || errorMessage !== null;

	const routeParams = Route.useParams();

	const loadedCategoryList = new Set<number>();
	if (productData && productData.categories) {
		for (const cat of productData.categories) {
			loadedCategoryList.add(cat.id);
		}
	}

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

	useEffect(() => {
		if (errorMessage && errorBox.current !== null) {
			errorBox.current.scrollIntoView();
		}
	}, [errorMessage]);

	const onSubmit = async () => {
		if (isPending) return;
		const patchProps = getValues(undefined, { dirtyFields: true });
		setFetchRequestMessages(null);
		startTransition(async () => {
			const successMessages: string[] = [];
			const res = await PatchDocumentById(routeParams.itemId, patchProps, successMessages);

			if (!res.success) {
				if (successMessages.length !== 0)
					setFetchRequestMessages(successMessages);
				
				if (successMessages.at(0) !== undefined)
					formReset({}, { keepValues: true });

				throw new Error(res.message);
			}
			else {
				setIsSuccess(true);
				navigate({ to: "/item/$itemId", params: { itemId: routeParams.itemId } });
			}
		});
	}

	const onError = () => {
		startTransition(async () => { throw new Error("One or more validation errors occurred.") });
	}

	const ctx: TEditFormContext = {
		isLoading: isPending || isSuccess,
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
					<form onSubmit={handleSubmit(onSubmit, onError)}>
						<div className="flex flex-col gap-4">
							{ errorMessage && (
								<PartialSuccessFetchMessage
									errorMsg={errorMessage}
									successes={fetchRequestMessages}
									ref={errorBox}
								/>
							)}
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
								value={Array.from(loadedCategoryList)}
							/>

							<AwaitedFieldSet
								as={FileUploadInput}
								name="files"
								label={`Product photos (up to ${GlobalConfig.MaxImagesPerListing} files)`}
								value={productData?.imageIds as any}
							>
								<FileUploadAttachments.FlaggedForDeletion name="filesToDelete" />
							</AwaitedFieldSet>

							<Button
								className="btn-primary"
								type="submit"
								disabled={isPending}
							>
								Save changes
							</Button>
						</div>
					</form>
				</FormProvider>
			</div>
		</EditFormContext>
	)
}

function PartialSuccessFetchMessage({
	errorMsg,
	successes,
	ref
}: {
	errorMsg: string,
	successes?: string[] | null,
	ref?: React.Ref<HTMLDivElement>
}) {
	return (
		<div className="flex flex-col gap-2 [&>div]:shadow-md" ref={ref}>
			{ (successes && successes.length !== 0) && (
				<div className="rounded-box px-2 py-1 border border-success-content/25 bg-success text-success-content">
					{ successes.map((succ, idx) => (
						<p key={idx}>{ succ }</p>
					))}
				</div>
			)}

			<div className="bg-error border border-error-content/25 text-error-content rounded-box px-2 py-1">
				<h1 className="font-bold">
					Error
				</h1>
				<p>
					{ errorMsg }
				</p>
			</div>
		</div>
	)
}

function AwaitedFieldSet<T extends keyof z.infer<typeof ProductPatchSchema>>({
	disabled,
	name,
	label,
	value,
	...rest
}: React.ComponentPropsWithRef<typeof FieldSet> & { value?: z.input<typeof ProductPatchSchema>[T], name: T }) {
	const { isLoading } = useContext(EditFormContext);
	const { getFieldState, trigger } = useFormContext<z.infer<typeof ProductPatchSchema>>();
	const { isDirty, error } = getFieldState(name);

	const myVal = value;

	const labelJsx = useCallback(() => (
		<>
			{label}
			<div className="flex gap-1 ml-2">
			{ isDirty && (
				<FormChangeAlertButton tooltip="This field was changed.">
					<FilePen className="inline-block stroke-primary-200" />
				</FormChangeAlertButton>
			)}
			{ error && (
				<AlertIcon className="stroke-destructive-content" />
			)}
			</div>
		</>
	), [label, isDirty, error]);

	const handleOnBlur = () => {
		trigger(name);
	}

	return (
		<FieldSet
			{...rest}
			name={name}
			label={labelJsx()}
			defaultValue={myVal}
			disabled={ isLoading || disabled }
			onBlur={handleOnBlur}
		/>
	);
}

function FormChangeAlertButton({ children, tooltip }: { children: React.ReactNode, tooltip: React.ReactNode }) {
	return (
		<Tooltip.Root>
			<Tooltip.Trigger asChild>
				{ children }
			</Tooltip.Trigger>
			<Tooltip.Portal>
				<Tooltip.Content
					sideOffset={4}
					className="bg-base-200 border border-base-300 px-3 py-2 rounded-box shadow-sm text-sm text-base-500/75 animate-slideUpAndFade"
				>
					{ tooltip }
					<Tooltip.Arrow className="fill-base-400" />
				</Tooltip.Content>
			</Tooltip.Portal>
		</Tooltip.Root>
	)
}
