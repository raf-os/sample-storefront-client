/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useReducer } from "react";

type TMutableObjectContext = {
    state: Record<string, any>,
    setState: (s: any) => void,
}

const MutableObjectContext = createContext<TMutableObjectContext>({ state: {}, setState: () => {} });

export function MutableContextProvider<T extends Record<string, any>>({ children, initialContext = {} }: { children?: React.ReactNode, initialContext?: Partial<T> }) {
    const [ stateContext, setStateContext ] = useState<Partial<T>>(initialContext);

    const mutateState = (newValues: Partial<T>) => {
        setStateContext(prev => ({ ...prev, ...newValues }));
    }

    const ctx = {
        state: stateContext,
        setState: mutateState
    };

    return (
        <MutableObjectContext value={ctx}>
            { children }
        </MutableObjectContext>
    )
}

export function useMutableContext<T extends Record<string, any> = any>() {
    const ctx = useContext(MutableObjectContext);

    const get = (keyname: keyof T) => {
        if (Object.hasOwn(ctx.state, keyname)) {
            return ctx.state[keyname as string];
        } else return null;
    }

    const set = (obj: Partial<T>) => {
        ctx.setState(obj);
    }

    return [
        get,
        set
    ] as const;
}