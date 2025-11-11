import { useTransition, useState, useContext, useRef, useImperativeHandle, useCallback } from "react";
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";

import { AddProductAction } from "@/lib/actions/productActions";
import { type CategoryTreeNode } from "@/lib/actions/categoryAction";
import { Command } from "cmdk";
import { EventBus } from "@/classes/EventBus";

import useCategoryTree from "@/hooks/useCategoryTree";
import CustomCommandContext, { type CommandEvents, type ICustomCommandContext } from "@/components/context/CustomCommandContext";

import * as Collapsible from "@radix-ui/react-collapsible";
import * as Popover from "@radix-ui/react-popover";
import { Input, TextArea, FieldSet } from "@/components/forms";
import Button from "@/components/button";
import { ChevronDown, Plus as PlusIcon } from "lucide-react";

import { CmdkInputSelect } from "@/components/custom-category-select/CmdkInputSelect";

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
	const inputRef = useRef<HTMLInputElement>(null);
	const listRef = useRef<SearchPopoverHandle>(null);
	const [ searchString, setSearchString ] = useState<string>("");
	const events = new EventBus<CommandEvents>();

	const isSearching = searchString !== "";

	const updateSearchString = useCallback((newSearch: string) => {
		if (newSearch !== "") setIsSearchPopoverOpen(true);
		else setIsSearchPopoverOpen(false);

		setSearchString(newSearch);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchString]);

	const addCategory = (id: number) => {
		if (selectedCategories.has(id)) return false;

		setSelectedCategories(prev => {
			const n = new Set(prev);
			n.add(id);
			return n;
		});

		setIsSearchPopoverOpen(false);
		events.emit('onCategorySelection');

		return true;
	}

	const removeCategory = (id: number) => {
		if (!selectedCategories.has(id)) return false;

		setSelectedCategories(prev => {
			const n = new Set(prev);
			n.delete(id);
			return n;
		});

		events.emit('onCategorySelection');

		return true;
	}

	const triggerSelection = () => {
		const el = listRef.current;
		if (!el) return;

		const item = el.getListSelection();
		if (!item) return;

		const event = new Event(cmdk.SELECT_EVENT);
		item?.dispatchEvent(event);

		return true;
	}

	const ctx: ICustomCommandContext = {
		searchValue: searchString,
		updateSearchString: updateSearchString,
		triggerSelection,
		selectedCategories,
		isSearching,
		addCategory,
		removeCategory,
		events,
	}

	return (
		<>
			<input {...rest} type="hidden" />
			<div className="w-full border border-base-300 rounded-box">

				<CustomCommandContext value={ctx}>
					<Command loop>

						<CmdkInputSelect
							ref={inputRef}
							selectedIds={selectedCategories}
						/>

						<SearchPopover
							open={isSearchPopoverOpen}
							onOpenChange={setIsSearchPopoverOpen}
							inputRef={inputRef.current}
							ref={listRef}
						/>

					</Command>

					<div className="flex flex-col gap-2 h-48 overflow-y-scroll p-2">
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
	const { addCategory } = useContext(CustomCommandContext);
	const ChildNodes: React.ReactElement<CategoryTreeNode>[] = [];

	const hasChildren = children && children.length > 0;

	if (hasChildren) {
		children.map(child => {
			if (!child) return;
			ChildNodes.push(<CategoryTreeNode {...child} key={child.id} depth={depth + 1} />);
		});
	}

	const Component = useCallback(() => (
		<div className="flex justify-between">
			<div
				onClick={e => { e.preventDefault(); addCategory(id); }}
				className="hover:text-primary-300 cursor-pointer"
			>
				{ name }
			</div>
			{ (hasChildren) && (
				<div>
					<ChevronDown className="group-data-[state=open]:rotate-180 transition-transform" />
				</div>
			)}
		</div>
	), [hasChildren, name, addCategory, id]);

	if (id == -1) return ChildNodes;

	return hasChildren
		? (
			<div className="border border-base-300 rounded-box">
				<Collapsible.Root>
					<Collapsible.Trigger className="w-full px-2 py-1 data-[state=open]:bg-base-100 rounded-t-box transition-colors group">
						<Component />
					</Collapsible.Trigger>

					<Collapsible.Content
						className="CollapsibleContent"
					>
						<div className="flex flex-col gap-2 px-2 py-3 border-t border-base-300">
							{ ChildNodes }
						</div>
					</Collapsible.Content>
				</Collapsible.Root>
			</div>
		) : (
			<>
				<Component />
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

	const handleOutsideInteraction: Popover.PopoverContentProps['onInteractOutside'] = (event) => {
		if (event.target === inputRef) {
			event.preventDefault();
		}
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
					onInteractOutside={handleOutsideInteraction}
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
	const { addCategory, selectedCategories } = useContext(CustomCommandContext);

	const isValid = !selectedCategories.has(node.id);

	const handleSelection = () => {
		addCategory(node.id);
	}

	return isValid ? (
		<Command.Item
			onSelect={handleSelection}
			className="px-2 py-0.5 cursor-pointer select-none data-[selected=true]:bg-primary-300 data-[selected=true]:text-primary-content"
			keywords={node.keywords}
			value={node.name}
			key={node.id}
		>
			{ node.name }
		</Command.Item>
	) : null;
}