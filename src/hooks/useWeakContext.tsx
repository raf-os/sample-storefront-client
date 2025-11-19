import { createContext, useContext } from "react";

const WeakContext = createContext({});

export function WeakProvide({ children }: { children?: React.ReactNode }) {
    return (
        <WeakContext.Provider value={{}}>
            { children }
        </WeakContext.Provider>
    )
}

export function WeakConsume<T = object>() {
    return useContext(WeakContext) as T;
}