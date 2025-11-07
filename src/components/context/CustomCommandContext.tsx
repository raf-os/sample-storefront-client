import { createContext } from "react";

export interface ICustomCommandContext {
    searchValue: string,
    isSearching: boolean,
}

const CustomCommandContext = createContext<ICustomCommandContext>({
    searchValue: "",
    isSearching: false
});

export default CustomCommandContext;