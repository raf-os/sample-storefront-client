import { createContext } from "react";

export interface ICustomCommandContext {
    searchValue: string,
    validCategoryIds: Set<number>,
    onItemValid?: (id: number) => boolean;
    onItemInvalid?: (id: number) => boolean;
}

const CustomCommandContext = createContext<ICustomCommandContext>({
    searchValue: "",
    validCategoryIds: new Set<number>(),
});

export default CustomCommandContext;