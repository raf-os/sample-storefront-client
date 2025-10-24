import { createContext } from "react";

import type { StandardJsonResponse } from "@/types/StandardJsonResponse";

export type TUserRoles = "User" | "Operator" | "Admin";

export type TAuthData = {
    userName: string,
    userId: string,
    exp: number,
    role: TUserRoles | string
}

export interface IAuthContext {
    authData?: TAuthData | null,
    login: (username: string, password: string) => Promise<StandardJsonResponse>,
    register: (username: string, password: string, email: string) => Promise<StandardJsonResponse>
}

export const DefaultAuthContext: IAuthContext = {
    login: async () => { return { success: false } },
    register: async () => { return { success: false } }
}

export const AuthContext = createContext<IAuthContext>(DefaultAuthContext);