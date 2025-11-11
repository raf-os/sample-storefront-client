import { useTransition, useState, useEffect, useContext, useRef, useImperativeHandle, useCallback } from "react";
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
import { cn, composeRefs } from "@/lib/utils";

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
	const [ searchString, setSearchString ] = useState<string>("");

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

	const triggerSelection = () => {
		const el = listRef.current;
		if (!el) return;

		const item = el.getListSelection();
		if (!item) return;

		const event = new Event(cmdk.SELECT_EVENT);
		item?.dispatchEvent(event);

		return true;

		// setIsSearchPopoverOpen(false);
	}

	const ctx: ICustomCommandContext = {
		searchValue: searchString,
		updateSearchString: updateSearchString,
		triggerSelection,
		isSearching,
		addCategory,
		removeCategory
	}
	// const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
	// 	if (event.key === 'Enter') {
	// 		event.preventDefault();
	// 		triggerSelection();
	// 	}
	// }

	return (
		<>
			<input {...rest} type="hidden" />
			<div className="w-full border border-base-300 rounded-box">
				<CustomCommandContext value={ctx}>
					<Command loop>
						{/* <Command.Input
							ref={inputRef}
							disabled={isRequestPending}
							className="w-full border-b border-base-300 px-2 py-1 outline-none"
							placeholder="Search..."
							value={inputValue}
							onValueChange={setInputValue}
							onKeyDown={handleKeyDown}
						/> */}

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

						{/* <SelectedCategoryList selectedIds={selectedCategories} /> */}
					</Command>

					<div className="h-48 overflow-y-scroll p-2">
						{ categoryTree && <CategoryTreeNode id={-1} name="%ROOT%" children={categoryTree} /> }
					</div>
				</CustomCommandContext>
			</div>
		</>
	)
}

type CmdkInputSelectProps = React.ComponentPropsWithRef<'input'> & {
	selectedIds: Set<number>
}

function CmdkInputSelect({
	ref,
	className,
	selectedIds,
	...rest
}: CmdkInputSelectProps) {
	const { flatTree } = useCategoryTree();
	const [ currentSelection, setCurrentSelection ] = useState<number | null>(null);
	const [ inputValue, setInputValue ] = useState<string>("");
	const debouncedSearch = useDebounce(inputValue);
	const cmdkInput = useRef<HTMLInputElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const { updateSearchString, triggerSelection, removeCategory } = useContext(CustomCommandContext);

	const selectionSize = Math.max(selectedIds.size - 1, 0);
	const isSelecting = (currentSelection !== null) && selectedIds.size > 0;

	useEffect(() => {
		updateSearchString(debouncedSearch);
	}, [debouncedSearch, updateSearchString]);

	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (!inputRef.current) return;
		switch(event.key) {
			case 'Enter': {
				event.preventDefault();
				const success = triggerSelection();
				if (success) { setInputValue(""); }
				break;
			}
			case 'ArrowLeft':
				if (inputRef.current.selectionStart === 0) {
					setCurrentSelection(prev => {
						if (prev === null) return selectionSize;
						else if (prev > 0) return prev - 1;
						else return prev;
					});
				}
				break;
			case 'ArrowRight':
				if (currentSelection !== null) {
					setCurrentSelection(prev => {
						if (prev === null) return prev;
						else if (prev < selectionSize) return prev + 1;
						else return null;
					});
				}
				break;
			case 'Backspace':
				if (inputRef.current.selectionStart === 0 && isSelecting) {
					const idToRemove = [...selectedIds][selectedIds.size - 1];
					removeCategory(idToRemove);
				} else if (isSelecting) {
					const idToRemove = [...selectedIds][currentSelection];
					removeCategory(idToRemove);
				}
				break;
			case 'Delete':
				if (isSelecting) {
					const idToRemove = [...selectedIds][currentSelection];
					removeCategory(idToRemove);
				}
				break;
			default:
				setCurrentSelection(null);
				break;
		}
	}

	const handleDeselect = () => {
		setCurrentSelection(null);
	}

	return (
		<div
			data-role="cmdk-input-wrapper"
			className="flex gap-2 border-base-300 border-b p-2"
		>
			{ selectedIds.size > 0 && (
				<div className="flex gap-1">
					{ [...selectedIds].map((item, idx) => (
						<SelectedCategoryListItem
							id={item}
							key={item}
							name={flatTree?.find(n => n.id === item)?.name || "ERROR"}
							isSelected={currentSelection === idx}
						/>
					))}
				</div>
			)}

			<input
				className={cn(
					"placeholder:text-base-300 grow-1 shrink-1 outline-0",
					isSelecting && "caret-transparent",
					className
				)}
				value={inputValue}
				onChange={(val) => setInputValue(val.target.value)}
				onKeyDown={handleKeyDown}
				onClick={handleDeselect}
				onBlur={handleDeselect}
				ref={composeRefs(ref, inputRef)}
				placeholder="Search..."
				{...rest}
			/>

			<Command.Input
				ref={cmdkInput}
				value={debouncedSearch}
				onValueChange={() => {}}
				disabled={true}
				className="hidden"
			/>
		</div>
	)
}

type SelectedCategoryListItemProps = {
	name: string,
	id: number,
	isSelected?: boolean
}

function SelectedCategoryListItem({
	name,
	id,
	isSelected
}: SelectedCategoryListItemProps) {
	const { removeCategory } = useContext(CustomCommandContext);
	const wrapperRef = useRef<HTMLDivElement>(null);

	return (
		<div
			ref={wrapperRef}
			className={cn(
				"flex shadow-xs rounded-full group bg-base-400 cursor-pointer select-none overflow-hidden transition-all",
				isSelected? "ring-3 ring-base-500/50 bg-destructive-content" : "hover:bg-destructive-content"
			)}
			data-selected={isSelected}
		>
			<span className="bg-base-100 px-1 py-0.5 text-sm font-medium rounded-r-full">
				{ name }
			</span>
			<div
				className="flex items-center justify-center overflow-hidden w-[4px] group-data-[selected=true]:w-7 group-hover:w-7 transition-all pr-0.5 grow-1 shrink-1 text-destructive"
				onClick={() => removeCategory(id)}
			>
				<XIcon size={20} strokeWidth={3} strokeLinecap="square" />
			</div>
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