import { useTransition, useState, useEffect } from "react";
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";

import { AddProductAction } from "@/lib/actions/productActions";
import { type CategoryTree, type CategoryTreeNode } from "@/lib/actions/categoryAction";
import { Command, useCommandState } from "cmdk";

import useCategoryTree from "@/hooks/useCategoryTree";

import { Input, TextArea, FieldSet } from "@/components/forms";
import Button from "@/components/button";
import { ChevronDown } from "lucide-react";

const NewProductSchema = z.object({
	name: z
		.string()
		.min(4, "Name must have at least 4 characters.")
		.max(100, "Name must be at most 100 characters long."),
	price: z
		.number("Price must be a number.")
		.positive("Price can't be negative."),
	description: z
		.string()
		.optional()
});

export const Route = createFileRoute('/app/user/products/new/')({
	component: RouteComponent,
})

function RouteComponent() {
	// TODO: maybe extract this transition + error message into a custom hook
	const [ isPending, startTransition ] = useTransition();
	const [ formError, setFormError ] = useState<string | null>(null);
	const navigate = useNavigate();

	const formMethods = useForm<z.infer<typeof NewProductSchema>>({
		resolver: zodResolver(NewProductSchema)
	});
	const { handleSubmit } = formMethods;

	const onSubmit = (data: z.infer<typeof NewProductSchema>) => {
		if (isPending) return;

		startTransition(async () => {
			const res = await AddProductAction(data);

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
				<form onSubmit={handleSubmit(onSubmit)}>
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

function CategorySelector({ ...rest }: React.ComponentPropsWithRef<'input'>) {
	const { isRequestPending, categoryTree } = useCategoryTree();
	const [ selectedCategories, setSelectedCategories ] = useState<number[]>([]);

	return (
		<>
		<input {...rest} type="hidden" />
		<Command className="w-full border border-base-300 rounded-box" shouldFilter={false}>
			<Command.Input
				asChild
			>
				<input
					disabled={isRequestPending}
					className="w-full border-b border-base-300 px-2 py-1 outline-none"

				/>
			</Command.Input>
			<Command.List className="h-48 overflow-y-scroll p-2">
				<Command.Empty>No results found.</Command.Empty>

				{ categoryTree && <CategoryTreeNode id={-1} name="%ROOT%" children={categoryTree} /> }
			</Command.List>
		</Command>
		</>
	)
}

type CategoryTreeNodeProps = CategoryTreeNode & {
	depth?: number,
};

function CategoryTreeNode({
	id,
	name,
	children,
	keywords,
	depth = 0
}: CategoryTreeNodeProps) {
	const ChildNodes: React.ReactElement<CategoryTreeNode>[] = [];

	const hasChildren = children && children.length > 0;

	if (hasChildren) {
		children.map(child => {
			if (!child) return;
			ChildNodes.push(<CategoryTreeNode {...child} key={child.id} depth={depth + 1} />);
		});
	}

	if (id == -1) return ChildNodes;

	const Component = () => (
		<Command.Item
			value={name}
			keywords={keywords}
		>
			<div className="flex justify-between">
				<div style={{ paddingLeft: (depth - 1) * 16 }}>
					{ name }
				</div>
				{ hasChildren && <div><ChevronDown /></div> }
			</div>
		</Command.Item>
	)

	const WrappedComponent = () => {
		return hasChildren
		? (
			<>
				<Component />

				{ ChildNodes }
			</>
		)
		: (
			<>
				<Component />
			</>
		)
	}

	return (
		<>
			<WrappedComponent />
		</>
	)
}