import { useState, useRef, useEffect, useContext } from "react";
import { Command } from "cmdk";

import CustomCommandContext from "@/components/context/CustomCommandContext";
import useCategoryTree from "@/hooks/useCategoryTree";
import useDebounce from "@/hooks/useDebouce";
import { cn, composeRefs } from "@/lib/utils";
import { X as XIcon } from "lucide-react";

type CmdkInputSelectProps = React.ComponentPropsWithRef<'input'> & {
	selectedIds: Set<number>
}

// I wish cmdk would expose their inner functions, but alas, this workaround with a
// "shadow" input is needed.
export function CmdkInputSelect({
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
	const { updateSearchString, triggerSelection, removeCategory, events } = useContext(CustomCommandContext);

	const selectionSize = Math.max(selectedIds.size - 1, 0);
	const isSelecting = (currentSelection !== null) && selectedIds.size > 0;

	useEffect(() => {
		updateSearchString(debouncedSearch);
	}, [debouncedSearch, updateSearchString]);

	useEffect(() => {
		const onCategorySelection = () => {
			setInputValue("");
		}
		return events.subscribe("onCategorySelection", onCategorySelection);
	}, [events]);

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
				if (inputRef.current.selectionStart === 0 && !isSelecting) {
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
					"placeholder:text-base-300 grow-1 shrink-1 outline-0 disabled:bg-base-300",
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