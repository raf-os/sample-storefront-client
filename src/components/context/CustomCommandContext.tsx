import { createContext } from "react";

export interface ICustomCommandContext {
    searchValue: string,
    isSearching: boolean,
    addCategory: (id: number) => boolean,
    removeCategory: (id: number) => boolean,
}

const CustomCommandContext = createContext<ICustomCommandContext>({
    searchValue: "",
    isSearching: false,
    addCategory: () => false,
    removeCategory: () => false,
});

export default CustomCommandContext;