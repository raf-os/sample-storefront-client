import { useState, useRef, useCallback, useEffect, useContext, useImperativeHandle } from "react";
import { Command } from "cmdk";

import { EventBus } from "@/classes/EventBus";
import CustomCommandContext, { type ICustomCommandContext, type CommandEvents } from "@/components/context/CustomCommandContext";
import useCategoryTree from "@/hooks/useCategoryTree";
import { useFormContext, type FieldValues } from "react-hook-form";

import { CmdkInputSelect } from "@/components/custom-category-select/CmdkInputSelect";
import * as Collapsible from "@radix-ui/react-collapsible";
import * as Popover from "@radix-ui/react-popover";

import { type CategoryTreeNode } from "@/lib/actions/categoryAction";
import type { WithRequired } from "@/types/utilities";

import {
    ChevronDown
} from "lucide-react";

const cmdk: Record<string, string> = {
	SELECT_EVENT: 'cmdk-item-select'
}

export default function CategorySelector({
	name
}: WithRequired<React.ComponentPropsWithRef<'input'>, "name">) {
	const { isRequestPending, categoryTree } = useCategoryTree();
	const [ selectedCategories, setSelectedCategories ] = useState<Set<number>>(new Set());
	const [ isSearchPopoverOpen, setIsSearchPopoverOpen ] = useState<boolean>(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const listRef = useRef<SearchPopoverHandle>(null);
	const [ searchString, setSearchString ] = useState<string>("");
	const { register, unregister, setValue } = useFormContext();
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

	useEffect(() => {
		register(name);
		return () => unregister(name);
	}, [register, unregister, name]);

	useEffect(() => {
		if (selectedCategories.size > 0) {
			setValue(name, selectedCategories);
		} else {
			setValue(name, undefined);
		}
	}, [setValue, selectedCategories, name]);

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
			<div className="w-full border border-base-300 rounded-box">

				<CustomCommandContext value={ctx}>
					<Command loop>

						<CmdkInputSelect
							ref={inputRef}
							selectedIds={selectedCategories}
							disabled={isRequestPending}
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

export type SearchPopoverProps = {
	open: boolean,
	onOpenChange: (open: boolean) => void,
	inputRef: HTMLInputElement | null,
	ref: React.Ref<SearchPopoverHandle>
}

export type SearchPopoverHandle = {
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