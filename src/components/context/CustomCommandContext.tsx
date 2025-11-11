import { createContext } from "react";
import { EventBus } from "@/classes/EventBus";

export type CommandEvents = {
    'onCategorySelection': void
}

export interface ICustomCommandContext {
    searchValue: string,
    isSearching: boolean,
    selectedCategories: Set<number>,
    events: EventBus<CommandEvents>,
    addCategory: (id: number) => boolean,
    removeCategory: (id: number) => boolean,
    updateSearchString: (newSearch: string) => void,
    triggerSelection: () => boolean | undefined | void,
}

const CustomCommandContext = createContext<ICustomCommandContext>({
    searchValue: "",
    isSearching: false,
    selectedCategories: new Set(),
    events: new EventBus(),
    addCategory: () => false,
    removeCategory: () => false,
    updateSearchString: () => {},
    triggerSelection: () => {}
});

export default CustomCommandContext;