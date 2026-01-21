import { createContext } from "react";

import type { StandardJsonResponse } from "@/types/StandardJsonResponse";

export type TUserRoles = "User" | "Operator" | "Admin";

export type TAuthData = {
    userName: string,
    userId: string,
    exp: number,
    role: TUserRoles | string,
}

export interface IAuthContext {
    authData?: TAuthData | null,
    token: string | null,
    login: (username: string, password: string) => Promise<StandardJsonResponse>,
    logout: () => Promise<StandardJsonResponse>,
    register: (username: string, password: string, email: string) => Promise<StandardJsonResponse>
}

const defaultResponse = async () => { return { success: false } };

export const DefaultAuthContext: IAuthContext = {
    login: defaultResponse,
    logout: defaultResponse,
    register: defaultResponse,
    token: null
}

export const AuthContext = createContext<IAuthContext>(DefaultAuthContext);
