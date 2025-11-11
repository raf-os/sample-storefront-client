import { createContext } from "react";

export interface ICustomCommandContext {
    searchValue: string,
    isSearching: boolean,
    addCategory: (id: number) => boolean,
    removeCategory: (id: number) => boolean,
    updateSearchString: (newSearch: string) => void,
    triggerSelection: () => boolean | undefined | void,
}

const CustomCommandContext = createContext<ICustomCommandContext>({
    searchValue: "",
    isSearching: false,
    addCategory: () => false,
    removeCategory: () => false,
    updateSearchString: () => {},
    triggerSelection: () => {}
});

export default CustomCommandContext;