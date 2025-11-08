import { useTransition, useState, useEffect, useContext, useRef, useImperativeHandle } from "react";
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
import { ChevronDown, X as XIcon } from "lucide-react";
import useDebounce from "@/hooks/useDebouce";

const cmdk: Record<string, string> = {
	SELECT_EVENT: 'cmdk-item-select'
}

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
	const [ selectedCategories, setSelectedCategories ] = useState<Set<number>>(new Set());
	const [ isSearchPopoverOpen, setIsSearchPopoverOpen ] = useState<boolean>(false);
	const [ inputValue, setInputValue ] = useState<string>("");
	const inputRef = useRef<HTMLInputElement>(null);
	const listRef = useRef<SearchPopoverHandle>(null);
	const debouncedSearch = useDebounce(inputValue);

	const isSearching = debouncedSearch !== "";

	useEffect(() => {
		if (debouncedSearch !== "") setIsSearchPopoverOpen(true);
		else setIsSearchPopoverOpen(false);
	}, [debouncedSearch]);

	const addCategory = (id: number) => {
		if (selectedCategories.has(id)) return false;

		setSelectedCategories(prev => {
			const n = new Set(prev);
			n.add(id);
			return n;
		});

		setIsSearchPopoverOpen(false);
		setInputValue("");

		return true;
	}

	const removeCategory = (id: number) => {
		if (!selectedCategories.has(id)) return false;

		setSelectedCategories(prev => {
			const n = new Set(prev);
			n.delete(id);
			return n;
		});

		return true;
	}

	const ctx: ICustomCommandContext = {
		searchValue: debouncedSearch,
		isSearching,
		addCategory,
		removeCategory
	}

	const triggerSelection = () => {
		const el = listRef.current;
		if (!el) return;

		const item = el.getListSelection();
		if (!item) return;

		const event = new Event(cmdk.SELECT_EVENT);
		item?.dispatchEvent(event);

		// setIsSearchPopoverOpen(false);
	}

	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Enter') {
			event.preventDefault();
			triggerSelection();
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
						placeholder="Search..."
						value={inputValue}
						onValueChange={setInputValue}
						onKeyDown={handleKeyDown}
					/>

					<SearchPopover
						open={isSearchPopoverOpen}
						onOpenChange={setIsSearchPopoverOpen}
						inputRef={inputRef.current}
						ref={listRef}
					/>

					<SelectedCategoryList selectedIds={selectedCategories} />

					</Command>

					<div className="h-48 overflow-y-scroll p-2">
						{ categoryTree && <CategoryTreeNode id={-1} name="%ROOT%" children={categoryTree} /> }
					</div>
				</CustomCommandContext>
			</div>
		</>
	)
}

type SelectedCategoryListProps = {
	selectedIds: Set<number>
}

type SelectedCategoryListItemProps = {
	name: string,
	id: number
}

function SelectedCategoryListItem({
	name,
	id
}: SelectedCategoryListItemProps) {
	const { removeCategory } = useContext(CustomCommandContext);

	return (
		<div
			className="flex shadow-xs rounded-full"
		>
			<span className="bg-base-300 px-2 py-0.5 text-sm font-medium rounded-l-full border border-r-0 border-base-400">
				{ name }
			</span>
			<div
				className="flex items-center justify-center w-7 pr-0.5 grow-1 shrink-1 rounded-r-full bg-destructive-content hover:bg-destructive-content/75 text-destructive cursor-pointer"
				onClick={() => removeCategory(id)}
			>
				<XIcon size={20} strokeWidth={3} strokeLinecap="square" />
			</div>
		</div>
	)
}

function SelectedCategoryList({
	selectedIds
}: SelectedCategoryListProps) {
	const { flatTree } = useCategoryTree();
	const isEmpty = selectedIds === undefined || selectedIds === null || selectedIds.size === 0;

	return (
		<div className="flex gap-2 border-b border-b-base-300 p-2">
			{ isEmpty
				? (
					<span className="text-sm text-base-400">
						No selections.
					</span>
				) : (
					<>
						{ [...selectedIds].map((item) => (
							<SelectedCategoryListItem id={item} key={item} name={flatTree?.find(n => n.id === item)?.name || "ERROR"} />
						))}
					</>
				)}
		</div>
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
	inputRef: HTMLInputElement | null,
	ref: React.Ref<SearchPopoverHandle>
}

type SearchPopoverHandle = {
	getListSelection: () => Element | undefined | null,
	listElement: HTMLDivElement | null
}

function SearchPopover({
	open,
	onOpenChange,
	inputRef,
	ref
}: SearchPopoverProps) {
	// const { searchValue } = useContext(CustomCommandContext);
	const listRef = useRef<HTMLDivElement>(null);

	const disableEvent = (e: Event) => { e.preventDefault(); }

	const getListSelection = () => {
		return listRef.current?.querySelector(`[cmdk-item=""][aria-selected="true"]`);
	}

	useImperativeHandle(ref, () => {
		return {
			getListSelection,
			listElement: listRef.current
		}
	});

	return (
		<Popover.Root
			open={open}
			onOpenChange={onOpenChange}
		>
			<Popover.Anchor />
			<Popover.Portal>
				<Popover.Content
					className="rounded-box border border-base-300 bg-base-200 shadow-sm overflow-hidden"
					align="start"
					alignOffset={4}
					sideOffset={4}
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

function FlatCommandList() {
	const { flatTree } = useCategoryTree();

	return (
		<>
			{ flatTree?.map((node) => (
				<NodeItem node={node} key={node.id} />
			))}
		</>
	)
}

function NodeItem({ node }: { node: CategoryTreeNode }) {
	const { addCategory } = useContext(CustomCommandContext);

	const handleSelection = () => {
		addCategory(node.id);
	}

	return (
		<Command.Item
			onSelect={handleSelection}
			className="px-2 py-0.5 cursor-pointer select-none data-[selected=true]:bg-primary-300 data-[selected=true]:text-primary-content"
			keywords={node.keywords}
			value={node.name}
			key={node.id}
		>
			{ node.name }
		</Command.Item>
	)
}