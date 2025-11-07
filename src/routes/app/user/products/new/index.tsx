import { useTransition, useState, useEffect, useContext, useRef } from "react";
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";

import { AddProductAction } from "@/lib/actions/productActions";
import { type CategoryTree, type CategoryTreeNode } from "@/lib/actions/categoryAction";
import { Command, useCommandState } from "cmdk";

import useCategoryTree from "@/hooks/useCategoryTree";
import CustomCommandContext, { type ICustomCommandContext } from "@/components/context/CustomCommandContext";

import * as Popover from "@radix-ui/react-popover";
import { Input, TextArea, FieldSet } from "@/components/forms";
import Button from "@/components/button";
import { ChevronDown } from "lucide-react";
import useDebounce from "@/hooks/useDebouce";

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
	const [ isSearchPopoverOpen, setIsSearchPopoverOpen ] = useState<boolean>(false);
	const [ inputValue, setInputValue ] = useState<string>("");
	const inputRef = useRef<HTMLInputElement>(null);
	const debouncedSearch = useDebounce(inputValue);

	const isSearching = debouncedSearch !== "";

	useEffect(() => {
		if (debouncedSearch !== "") setIsSearchPopoverOpen(true);
		else setIsSearchPopoverOpen(false);
	}, [debouncedSearch]);

	const ctx: ICustomCommandContext = {
		searchValue: debouncedSearch,
		isSearching
	}

	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Enter') {
			event.preventDefault();
		}
	}

	return (
		<>
			<input {...rest} type="hidden" />
			<div className="w-full border border-base-300 rounded-box">
				<CustomCommandContext value={ctx}>
					<Command loop>
					<Command.Input
						ref={inputRef}
						disabled={isRequestPending}
						className="w-full border-b border-base-300 px-2 py-1 outline-none"
						value={inputValue}
						onValueChange={setInputValue}
						onKeyDown={handleKeyDown}
					/>

					<SearchPopover open={isSearchPopoverOpen} onOpenChange={setIsSearchPopoverOpen} inputRef={inputRef.current} />
					</Command>

					<div className="h-48 overflow-y-scroll p-2">
						{ categoryTree && <CategoryTreeNode id={-1} name="%ROOT%" children={categoryTree} /> }
					</div>
				</CustomCommandContext>
			</div>
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
		<div className="flex justify-between">
			<div style={{ paddingLeft: (depth - 1) * 16 }}>
				{ name }
			</div>
			{ (hasChildren) && <div><ChevronDown /></div> }
		</div>
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

type SearchPopoverProps = {
	open: boolean,
	onOpenChange: (open: boolean) => void,
	inputRef: HTMLInputElement | null
}

function SearchPopover({
	open,
	onOpenChange,
	inputRef
}: SearchPopoverProps) {
	const { searchValue } = useContext(CustomCommandContext);
	const listRef = useRef<HTMLDivElement>(null);

	const disableEvent = (e: Event) => { e.preventDefault(); }

	const getListSelection = () => {
		return listRef.current?.querySelector(`[cmdk-item=""][aria-selected="true"]`);
	}

	return (
		<Popover.Root
			open={open}
			onOpenChange={onOpenChange}
		>
			<Popover.Anchor />
			<Popover.Portal>
				<Popover.Content
					className="rounded-box border border-base-300 bg-base-200 px-2 py-1 shadow-sm"
					align="start"
					alignOffset={12}
					sideOffset={6}
					onOpenAutoFocus={disableEvent}
					onInteractOutside={(e) => { if (e.target === inputRef) e.preventDefault() }}
					onClick={() => console.log(getListSelection())}
				>
						<Command.List ref={listRef} data-debug="DEBUG ME MATE">
							<Command.Empty>No results found.</Command.Empty>

							<FlatCommandList />
						</Command.List>
				</Popover.Content>
			</Popover.Portal>
		</Popover.Root>
	)
}

function traverseCategoryTree(node: CategoryTreeNode, currentTree: CategoryTree = []) {
	if (!node.children || node.children.length === 0) return;

	node.children.map(child => {
		currentTree.push(child);
		if (child.children && child.children.length > 0) traverseCategoryTree(child, currentTree);
	});

	return currentTree;
}

function FlatCommandList() {
	const { categoryTree } = useCategoryTree();
	const flatTree = traverseCategoryTree({ id: -1, name: "%ROOT%", children: categoryTree });

	return (
		<>
			{ flatTree?.map((node) => (
				<NodeItem node={node} key={node.id} />
			))}
		</>
	)
}

function NodeItem({ node }: { node: CategoryTreeNode }) {
	return (
		<Command.Item
			onSelect={val => console.log(val)}
			className="data-[selected=true]:bg-blue-400"
			keywords={node.keywords}
			value={node.name}
			key={node.id}
		>
			{ node.name }
		</Command.Item>
	)
}